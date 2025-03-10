from multimodalsim.observer.visualizer import Visualizer
from communication.active_mq_controller import ActiveMQController
from communication.connection_credentials import ConnectionCredentials
from communication.log_levels import LogLevels
import json
import logging
import pprint
DEBUG = False

logger = logging.getLogger(__name__)
# logger.disabled = True

class FrontendVisualizer(Visualizer):

    def __init__(self, data_analyzer=None, level=LogLevels.INFO):
        super().__init__()
        self.__data_analyzer = data_analyzer
        self.__last_time = None
        if not DEBUG:
            self.connection = ActiveMQController.getConnection()

        self.level = level

    def visualize_environment(self, env, current_event=None, event_index=None,
                              event_priority=None):


        if self.__last_time is None or env.current_time != self.__last_time:
            body = "current_time:{}".format(env.current_time)
            if not DEBUG:
                self.connection.send(ConnectionCredentials.INFO_QUEUE, body=body)
            self.__last_time = env.current_time

        if self.level == LogLevels.DEBUG:
            self.__print_debug(env, current_event, event_index, event_priority)
        if not DEBUG:
            try:
                body = json.dumps(current_event.__dict__, default=lambda x: str(x)) if current_event != None else 'None'
            except:
                body = json.dumps(current_event.__dict__, default=lambda x: str(x))
            # self.connection.send(ConnectionCredentials.EVENT_QUEUE, body = body)
        if self.__data_analyzer is not None:
            self.__print_statistics()

    def __print_debug(self, env, current_event, event_index, event_priority):
        debug_dict = dict()
        debug_dict['title'] = "visualize_environment"
        
        current_event_info = dict()
        if current_event is not None:
            current_event_info['current_time'] = env.current_time
            current_event_info['event_time'] = current_event.time
            current_event_info['event_index'] = event_index
            current_event_info['current_event'] = current_event.__dict__
            # current_event_info['current_event']['_Event__queue'] = current_event_info['current_event']['_Event__queue'].__dict__
            # current_event_info['current_event']['_VehicleReady__vehicle'] = current_event_info['current_event']['_VehicleReady__vehicle'].__dict__
            current_event_info['event_priority'] = event_priority
        else:
            current_event_info['event_time'] = env.current_time
            current_event_info['event_index'] = event_index
            current_event_info['current_event'] = current_event
            current_event_info['event_priority'] = event_priority
        
        debug_dict['current_event_info'] = current_event_info
        
        env_status = dict()
        env_status['current_time'] = env.current_time
        env_status['optimization_status'] = env.optimization.status
        
        environment = dict()
        environment['__trips'] = [trip.id for trip in env.trips]
        environment['__assigned_trips'] = [trip.id for trip in env.assigned_trips]
        environment['__non_assigned_trips'] = [trip.id for trip in env.non_assigned_trips]
        environment['__vehicles'] = [veh.id for veh in env.vehicles]
        environment['__assigned_vehicles'] = [veh.id for veh in env.assigned_vehicles]
        environment['__non_assigned_vehicles'] = [veh.id for veh in env.non_assigned_vehicles]
        env_status['environment'] = environment
        debug_dict['env_status'] = env_status


        vehicles = []
        for veh in env.vehicles:
            vehicle = dict()
            vehicle['_Vehicle__id'] = veh._Vehicle__id
            assigned_legs_id = [leg.id for leg in veh.route.assigned_legs]
            onboard_legs_id = [leg.id for leg in veh.route.onboard_legs]
            alighted_legs_id = [leg.id for leg in veh.route.alighted_legs]

            vehicle['status'] = veh.route.status
            vehicle['start_time'] = veh.start_time
            vehicle['assigned_legs_id'] = assigned_legs_id
            vehicle['onboard_legs_id'] = onboard_legs_id
            vehicle['alighted_legs_id'] = alighted_legs_id
            
            prev_stops = []
            for stop in veh.route.previous_stops:
                stop_dict = dict()
                stop_dict[str(stop.location)] = stop.__dict__
                prev_stops.append(stop_dict)
            vehicle['prev_stops'] = prev_stops

            if veh.route.current_stop is not None:
                current_stop = dict()
                current_stop[str(veh.route.current_stop.location)] = veh.route.current_stop.__dict__
                vehicle['current_stop'] = current_stop
            else:
                vehicle['current_stop'] = veh.route.current_stop

            next_stops = []
            for stop in veh.route.next_stops:
                next_stop = dict()
                next_stop[str(stop.location)] = stop.__dict__
                next_stops.append(next_stop)
            vehicle['next_stops'] = next_stops
            vehicles.append(vehicle)
        debug_dict['vehicles'] = vehicles
        
        requests = []
        for trip in env.trips:
            request = dict()
            if trip.current_leg is not None:
                current_leg = {"O": trip.current_leg.origin.__str__(),
                               "D": trip.current_leg.destination.__str__(),
                               "veh_id":
                                   trip.current_leg.assigned_vehicle.id,
                               "boarding_time": trip.current_leg.boarding_time,
                               "alighting_time":
                                   trip.current_leg.alighting_time} \
                    if trip.current_leg.assigned_vehicle is not None \
                    else {"O": trip.current_leg.origin.__str__(),
                          "D": trip.current_leg.destination.__str__()}
            else:
                current_leg = None
            previous_legs = [
                {"O": leg.origin.__str__(), "D": leg.destination.__str__(),
                 "veh_id": leg.assigned_vehicle.id,
                 "boarding_time": leg.boarding_time,
                 "alighting_time": leg.alighting_time}
                for leg in trip.previous_legs] if hasattr(
                trip, 'previous_legs') and trip.previous_legs is not None \
                else None
            next_legs = [{"O": leg.origin.__str__(),
                          "D": leg.destination.__str__()}
                         for leg in trip.next_legs] \
                if hasattr(trip, 'next_legs') and trip.next_legs is not None \
                else None

            request["current_leg"] = current_leg
            request["previous_legs"] = previous_legs
            request["next_legs"] = next_legs
            requests.append(request)            
        debug_dict['requests'] = requests
        if DEBUG:
            pprint.pprint(json.dumps(debug_dict, default=lambda x: str(x)))
            input()
        else:
            self.connection.send(ConnectionCredentials.INFO_QUEUE, json.dumps(debug_dict,default=lambda x: str(x)))

    def __print_statistics(self):
        vehicles_stats = self.__data_analyzer.get_vehicles_statistics()
        logger.info(vehicles_stats)
        self.connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(vehicles_stats, default=lambda x: str(x)))
        modes = self.__data_analyzer.modes
        if len(modes) > 1:
            for mode in modes:
                mode_vehicles_stats = \
                    self.__data_analyzer.get_vehicles_statistics(mode)
                logger.info("{}: {}".format(mode, mode_vehicles_stats))
                self.connection.send(ConnectionCredentials.INFO_QUEUE, body="{}: {}".format(mode, mode_vehicles_stats))
    
        trips_stats = self.__data_analyzer.get_trips_statistics()
        logger.info(trips_stats)
        self.connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(trips_stats, default=lambda x: str(x)))
        modes = self.__data_analyzer.modes
        if len(modes) > 1:
            for mode in modes:
                mode_trips_stats = \
                    self.__data_analyzer.get_trips_statistics(mode)
                logger.info("{}: {}".format(mode, mode_trips_stats))
                self.connection.send(ConnectionCredentials.INFO_QUEUE, body="{}: {}".format(mode, mode_trips_stats))


