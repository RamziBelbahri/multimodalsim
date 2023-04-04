import json
import logging
import pandas as pd

from datetime import datetime

import multimodalsim.simulator.request
import multimodalsim.simulator.vehicle
import multimodalsim.simulator.passenger_event
import multimodalsim.simulator.vehicle_event
from multimodalsim.config.data_collector_config import DataCollectorConfig
from multimodalsim.simulator.event import ActionEvent
from multimodalsim.state_machine.status import PassengersStatus, VehicleStatus
from multimodalsim.observer.data_collector import DataCollector
from multimodalsim.observer.data_collector import DataContainer
from communication.active_mq_controller import ActiveMQController
from communication.connection_credentials import ConnectionCredentials

from copy import deepcopy

N_SECONDS_DAY       = 24*60*60
N_SECONDS_HOUR      = 60*60
N_SECONDS_MINUTE    = 60
logger = logging.getLogger(__name__)


class FrontendDataCollector(DataCollector):

    def __init__(self, data_container=None, config=None):
        super().__init__()
        self.connection = ActiveMQController().getConnection()
        self.__data_container = DataContainer() if data_container is None \
            else data_container

        self.__env = None
        self.__event_index = None
        self.__event_priority = None
        self.__current_event = None
        self.__time = None

        config = DataCollectorConfig() if config is None else config
        self.__load_config(config)

    @property
    def data_container(self):
        return self.__data_container
    
    def __get_duration(self, duration_in_seconds:int):
        # duration_in_seconds = # en secondes
        # days    = int(duration_in_seconds / N_SECONDS_DAY)
        # hours   = int((duration_in_seconds - days * N_SECONDS_DAY) / N_SECONDS_HOUR)
        # minutes = int((duration_in_seconds - days* N_SECONDS_DAY - hours * N_SECONDS_HOUR)/60)
        # seconds = int(duration_in_seconds - days* N_SECONDS_DAY - hours * N_SECONDS_HOUR - minutes * N_SECONDS_MINUTE)
        # duration = str(days) + ' days ' + \
        #     (str(hours)     if len(str(hours))      >= 2 else ('0' + str(hours)  )) + ':' + \
        #     (str(minutes)   if len(str(minutes))    >= 2 else ('0' + str(minutes))) + ':' + \
        #     (str(seconds)   if len(str(seconds))    >= 2 else ('0' + str(seconds)))
        return duration_in_seconds
    
    def collect(self, env, current_event=None, event_index=None,
                event_priority=None):
        self.__env = env
        self.__current_event = current_event
        self.__event_priority = event_priority
        self.__event_index = event_index
        self.__time = self.__current_event.time \
            if self.__current_event is not None else self.__env.current_time

        if (isinstance(current_event, ActionEvent)
                and isinstance(current_event.state_machine.owner,
                               multimodalsim.simulator.request.Trip)):
            self.__collect_trips_data(current_event.state_machine.owner)
        elif hasattr(current_event, "trip"):
            self.__collect_trips_data(current_event.trip)
        elif isinstance(current_event, ActionEvent) \
                and isinstance(current_event.state_machine.owner,
                               multimodalsim.simulator.vehicle.Route):
            self.__collect_vehicles_data(current_event.state_machine.owner)
        elif hasattr(current_event, "vehicle"):
            self.__collect_vehicles_data(current_event.vehicle.route)

        self.__collect_events_data()

        self.__collect_environment_data(env)

    def __load_config(self, config):
        self.__data_container.set_columns("vehicles",
                                          config.get_vehicles_columns())
        self.__data_container.set_columns("trips",
                                          config.get_trips_columns())
        self.__data_container.set_columns("events",
                                          config.get_events_columns())

    def __collect_vehicles_data(self, route:multimodalsim.simulator.vehicle.Route):

        previous_stops = [str(stop.location) for stop
                          in route.previous_stops]
        current_stop_loc = route.current_stop.location \
            if route.current_stop is not None else None
        next_stops = [str(stop.location) for stop
                      in route.next_stops]

        assigned_legs = [leg.id for leg in route.assigned_legs]
        onboard_legs = [leg.id for leg in route.onboard_legs]
        alighted_legs = [leg.id for leg in route.alighted_legs]

        cumulative_distance = route.current_stop.cumulative_distance \
            if route.current_stop is not None else None

        stop_lon = current_stop_loc.lon \
            if current_stop_loc is not None else None
        stop_lat = current_stop_loc.lat \
            if current_stop_loc is not None else None
        lon = route.vehicle.position.lon \
            if route.vehicle.position is not None else None
        lat = route.vehicle.position.lat \
            if route.vehicle.position is not None else None

        polylines = route.vehicle.polylines \
            if route.vehicle.polylines is not None else None

        mode = route.vehicle.mode
        # print(polylines)
        obs_dict = {"id": route.vehicle.id,
                    "time": self.__time,
                    "status": route.status,
                    "previous_stops": previous_stops,
                    "current_stop": str(current_stop_loc),
                    "next_stops": next_stops,
                    "assigned_legs": assigned_legs,
                    "onboard_legs": onboard_legs,
                    "alighted_legs": alighted_legs,
                    "cumulative_distance": cumulative_distance,
                    "stop_lon": stop_lon,
                    "stop_lat": stop_lat,
                    "lon": lon,
                    "lat": lat,
                    "polylines": polylines,
                    "mode": mode}
        self.__data_container.add_observation(
            "vehicles", obs_dict, "id")
        self.__update_trip_cumulative_distance_by_vehicle(route.vehicle)

        obs_dict_to_send = deepcopy(obs_dict)
        obs_dict_to_send['event_type'] = 'VEHICLE'
        if route.status == VehicleStatus.ENROUTE:
            duration = self.__get_duration(route.next_stops[0].arrival_time - route.previous_stops[-1].departure_time)
            print("duration", route.status, duration)
            obs_dict_to_send["duration"] = duration
            
        self.connection.send(ConnectionCredentials.ENTITY_EVENTS_QUEUE, json.dumps(obs_dict_to_send, default= lambda x: str(x)))

    def __update_trip_cumulative_distance_by_vehicle(self, veh):

        if "trips_cumulative_distance" \
                not in self.__data_container.observations_tables:
            self.__data_container.observations_tables[
                "trips_cumulative_distance"] = {}

        cumdist_by_veh_by_trip = self.__data_container.observations_tables[
                "trips_cumulative_distance"]

        if veh.route.current_stop is not None:
            current_veh_cumdist = \
                veh.route.current_stop.cumulative_distance
        else:
            current_veh_cumdist = \
                veh.route.previous_stops[-1].cumulative_distance

        for leg in veh.route.assigned_legs:
            trip = leg.trip

            if trip.id not in cumdist_by_veh_by_trip:
                cumdist_by_veh_by_trip[trip.id] = {}

            if veh.id not in cumdist_by_veh_by_trip[trip.id]:
                cumdist_by_veh_by_trip[trip.id][veh.id] = \
                    {"cumdist": 0, "veh_cumdist": current_veh_cumdist}
            else:
                cumdist_by_veh_by_trip[trip.id][veh.id]["cumdist"] += \
                    current_veh_cumdist \
                    - cumdist_by_veh_by_trip[trip.id][veh.id]["veh_cumdist"]
                cumdist_by_veh_by_trip[trip.id][veh.id]["veh_cumdist"] = \
                    current_veh_cumdist

    def __collect_trips_data(self, trip):

        assigned_vehicle_id = self.__get_assigned_vehicle_id(trip)
        current_location = self.__get_current_location(trip)

        previous_legs = [(str(leg.origin), str(leg.destination)) for leg
                         in trip.previous_legs] \
            if trip.previous_legs is not None else None
        current_leg = (str(trip.current_leg.origin),
                       str(trip.current_leg.destination)) \
            if trip.current_leg is not None else None

        next_legs = [(str(leg.origin), str(leg.destination)) for leg
                     in trip.next_legs] \
            if trip.next_legs is not None else None

        obs_dict = {"id": trip.id,
                    "time": self.__time,
                    "status": trip.status,
                    "assigned_vehicle": str(assigned_vehicle_id),
                    "current_location": str(current_location),
                    "previous_legs": previous_legs,
                    "current_leg": current_leg,
                    "next_legs": next_legs,
                    "name": trip.name}

        self.__data_container.add_observation("trips", obs_dict, "id")

        self.__update_trip_cumulative_distance_by_trip(trip)
        obs_dict['event_type'] = 'PASSENGER'
        self.connection.send(ConnectionCredentials.ENTITY_EVENTS_QUEUE, json.dumps(obs_dict, default= lambda x: str(x)))
        

    def __get_assigned_vehicle_id(self, trip):
        if trip.current_leg is not None \
                and trip.current_leg.assigned_vehicle is not None:
            assigned_vehicle_id = trip.current_leg.assigned_vehicle.id
        else:
            assigned_vehicle_id = None

        return assigned_vehicle_id

    def __get_current_location(self, trip):

        current_location = None
        if trip.current_leg is not None \
                and trip.status in [PassengersStatus.RELEASE,
                                    PassengersStatus.ASSIGNED,
                                    PassengersStatus.READY]:
            current_location = trip.current_leg.origin
        elif trip.current_leg is not None \
                and trip.status == PassengersStatus.COMPLETE:
            current_location = trip.current_leg.destination

        return current_location

    def __update_trip_cumulative_distance_by_trip(self, trip):

        if "trips_cumulative_distance" \
                not in self.__data_container.observations_tables:
            self.__data_container.observations_tables[
                "trips_cumulative_distance"] = {}

        cumdist_by_veh_by_trip = self.__data_container.observations_tables[
                "trips_cumulative_distance"]
        if trip.current_leg.assigned_vehicle is not None:
            veh = trip.current_leg.assigned_vehicle

            if veh.route.current_stop is not None:
                current_veh_cumdist = \
                    veh.route.current_stop.cumulative_distance
            else:
                current_veh_cumdist = \
                    veh.route.previous_stops[-1].cumulative_distance

            if trip.id not in cumdist_by_veh_by_trip:
                cumdist_by_veh_by_trip[trip.id] = {}

            if veh.id not in cumdist_by_veh_by_trip[trip.id]:
                cumdist_by_veh_by_trip[trip.id][veh.id] = \
                    {"cumdist": 0, "veh_cumdist": current_veh_cumdist}
            else:
                cumdist_by_veh_by_trip[trip.id][veh.id]["cumdist"] += \
                    current_veh_cumdist \
                    - cumdist_by_veh_by_trip[trip.id][veh.id]["veh_cumdist"]
                cumdist_by_veh_by_trip[trip.id][veh.id]["veh_cumdist"] = \
                    current_veh_cumdist

    def __collect_events_data(self):

        event_name = self.__current_event.name \
            if self.__current_event is not None else None

        obs_dict = {"name": event_name,
                    "time": self.__time,
                    "priority": self.__event_priority,
                    "index": self.__event_index}
        self.__data_container.add_observation("events", obs_dict, "index")

    def __collect_environment_data(self, env):

        trips_by_mode = {None: 0}
        active_trips_by_mode = {None: 0}
        for trip in env.trips:
            self.__collect_total_nb_trips(trip, trips_by_mode)
            self.__collect_nb_active_trips(trip, active_trips_by_mode)

        self.__data_container.observations_tables["total_nb_trips_by_mode"] \
            = trips_by_mode
        self.__data_container.observations_tables["nb_active_trips_by_mode"] \
            = active_trips_by_mode

    def __collect_total_nb_trips(self, trip, trips_by_mode):

        trips_by_mode[None] += 1
        trip_modes = set()
        for leg in trip.previous_legs:
            trip_modes.add(leg.assigned_vehicle.mode)
        if trip.current_leg is not None \
                and trip.current_leg.assigned_vehicle is not None:
            mode = trip.current_leg.assigned_vehicle.mode
            trip_modes.add(mode)
        for mode in trip_modes:
            trips_by_mode[mode] = trips_by_mode[mode] + 1 \
                if mode in trips_by_mode else 1

    def __collect_nb_active_trips(self, trip, active_trips_by_mode):

        if trip.status != PassengersStatus.COMPLETE:
            active_trips_by_mode[None] += 1
            if trip.current_leg is not None \
                    and trip.current_leg.assigned_vehicle is not None:
                mode = trip.current_leg.assigned_vehicle.mode
                if mode not in active_trips_by_mode:
                    active_trips_by_mode[mode] = 1
                else:
                    active_trips_by_mode[mode] += 1

