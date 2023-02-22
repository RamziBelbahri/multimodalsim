from multimodalsim.observer.visualizer import Visualizer
from active_mq_controller import ActiveMQController
import json

import logging

import pprint

logger = logging.getLogger(__name__)

class FrontendVisualizer(Visualizer):

    def __init__(self, data_analyzer=None):
        super().__init__()
        self.__data_analyzer = data_analyzer
        self.__last_time = None
        self.connection = ActiveMQController.getConnection()
        self.info_queue = '/queue/info'
        self.event_queue = '/queue/event'

    def visualize_environment(self, env, current_event=None, event_index=None,
                              event_priority=None):

        if self.__last_time is None or env.current_time != self.__last_time:
            body = "current_time:{}".format(env.current_time)
            # self.connection.send(self.info_queue, body=body)
            self.__last_time = env.current_time

        if logger.parent.level == logging.DEBUG:
            self.__print_debug(env, current_event, event_index, event_priority)

        # self.connection.send(self.event_queue, body = json.dumps(current_event.__dict__) if current_event != None else 'None')

    def __print_debug(self, env, current_event, event_index, event_priority):
        debug_dict = dict()
        debug_dict['title'] = "visualize_environment"
        
        current_event_info = dict()
        if current_event is not None:
            current_event_info['current_time'] = env.current_time
            current_event_info['event_time'] = current_event.time
            current_event_info['event_index'] = event_index
            current_event_info['current_event'] = current_event.__dict__
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
                stop = dict()
                stop[str(stop.location)] = stop.__dict__
                prev_stops.append(stop)
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
        pprint.pprint(debug_dict)
        input()

    def __print_statistics(self):
        logger.info("nb_trips: {}, nb_vehicles: {}, distance: {}, ghg-e: {}"
                    .format(self.__data_analyzer.nb_trips,
                            self.__data_analyzer.nb_vehicles,
                            self.__data_analyzer.total_distance_travelled,
                            self.__data_analyzer.total_ghg_e))

