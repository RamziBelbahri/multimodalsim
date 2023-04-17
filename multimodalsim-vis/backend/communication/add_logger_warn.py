import logging
import networkx as nx
from communication.active_mq_controller import ActiveMQController
from communication.connection_credentials import ConnectionCredentials
from multimodalsim.simulator.travel_times import MatrixTravelTimes
from multimodalsim.reader.data_reader import GTFSReader
from multimodalsim.reader.travel_times_reader import MatrixTravelTimesReader
from multimodalsim.simulator.coordinates import CoordinatesOSRM
from multimodalsim.simulator.event import Event
import json
connection = ActiveMQController().getConnection()
import polyline
import requests

#DataReader
def get_network_graph(self, available_connections=None, freeze_interval=5):
    logger = logging.getLogger(__name__)
    available_connections = {} if available_connections is None \
        else available_connections

    if self.__stop_times_by_trip_id_dict is None:
        self.__read_stop_times()

    logger.debug("get_network_graph")
    connection.send(
                    ConnectionCredentials.INFO_QUEUE,
                    body="get_network_graph")
    self.__network_graph = nx.DiGraph()

    for trip_id, stop_time_list in self.__stop_times_by_trip_id_dict. \
            items():

        first_stop_time = stop_time_list[0]
        previous_node = (first_stop_time.stop_id, first_stop_time.trip_id,
                            first_stop_time.arrival_time,
                            first_stop_time.departure_time)

        for stop_time in stop_time_list:

            current_node = (stop_time.stop_id, stop_time.trip_id,
                            stop_time.arrival_time,
                            stop_time.departure_time)

            if current_node[2] - previous_node[2] <= 0 \
                    and previous_node != current_node:
                logger.warning("{}: previous_node: {} -> current_node: {}"
                                .format(current_node[2] - previous_node[2],
                                        previous_node, current_node))
                connection.send(
                    ConnectionCredentials.INFO_QUEUE,
                    body="{}: previous_node: {} -> current_node: {}"
                        .format(
                            current_node[2] - previous_node[2],
                            previous_node, current_node
                        )
                )

            self.__network_graph.add_edge(
                previous_node, current_node,
                weight=current_node[2] - previous_node[2])
            previous_node = current_node

    for node1 in self.__network_graph.nodes:
        for node2 in self.__network_graph.nodes:
            if (node1[0] == node2[0] or node1[0] in available_connections
                and node2[0] in available_connections[node1[0]]) \
                    and node1[1] != node2[1]:
                # Nodes correspond to same stop but different vehicles
                if (node2[3] - node1[2]) >= freeze_interval:
                    # Departure time of the second node is greater than or
                    # equal to the arrival time of the first
                    # node. A connection is possible.
                    if node2[3] - node1[2] < 0:
                        logger.warning(
                            "{}: node2: {} -> node1: {}".format(
                                node2[3] - node1[2], node2, node1))
                        connection.send(ConnectionCredentials.INFO_QUEUE, body="{}: node2: {} -> node1: {}".format(node2[3] - node1[2], node2, node1))
                    self.__network_graph.add_edge(
                        node1, node2, weight=node2[3] - node1[2])

    return self.__network_graph

#TravelTimesReader
def get_matrix_travel_times(self):
    logger = logging.getLogger(__name__)
    times_matrix = self.__read_from_file()
    logger.warning(times_matrix)
    matrix_travel_times = MatrixTravelTimes(times_matrix)
    return matrix_travel_times

#Coordinates
def __extract_polylines_from_response(self, res, stop_ids):
    logger = logging.getLogger(__name__)
    polylines = {}

    legs = res['routes'][0]['legs']
    coordinates = polyline.decode(res["routes"][0]["geometry"],
                                    geojson=True)

    if len(legs) != (len(stop_ids) - 1):
        logger.warning("len(legs) ({}) is different from  len(stop_ids) "
                        "({})".format(len(legs), len(stop_ids)))
        connection.send(ConnectionCredentials.INFO_QUEUE, body="len(legs) ({}) is different from  len(stop_ids) "
                        "({})".format(len(legs), len(stop_ids)))

    start_coord_index = 0
    for leg_index in range(len(legs)):
        leg = legs[leg_index]

        leg_durations = leg['annotation']['duration']
        total_duration = sum(leg_durations)
        leg_durations_frac = [d / total_duration for d in leg_durations] \
            if total_duration > 0 else [1]

        end_coord_index = start_coord_index + len(leg_durations) + 1
        leg_coordinates = coordinates[start_coord_index:end_coord_index]
        leg_polyline = polyline.encode(leg_coordinates, geojson=True)

        polylines[stop_ids[leg_index]] = (leg_polyline, leg_durations_frac)

        # The last coordinates of a given leg are the same as the first
        # coordinates of the next leg
        start_coord_index = end_coord_index - 1

    return polylines

def update_polylines(self, route):
    logger = logging.getLogger(__name__)

    polylines = {}

    all_stops = []
    all_stops.extend(route.previous_stops)
    if route.current_stop is not None:
        all_stops.append(route.current_stop)
    all_stops.extend(route.next_stops)

    stop_coordinates = [(stop.location.lon, stop.location.lat)
                        for stop in all_stops]
    stop_ids = [stop.location.label for stop in all_stops]

    if len(stop_coordinates) > 2:
        coordinates_str_list = [str(coord[0]) + "," + str(coord[1])
                                for coord in stop_coordinates]

        service_url = "route/v1/driving/"
        coord_url = ";".join(coordinates_str_list)
        args_url = "?annotations=true&overview=full"

        request_url = self.__osrm_url + service_url + coord_url + args_url

        response = requests.get(request_url)

        res = response.json()

        if res['code'] == 'Ok':
            polylines = \
                self.__extract_polylines_from_response(res, stop_ids)
        else:
            logger.warning(request_url)
            connection.send(ConnectionCredentials.INFO_QUEUE, body=request_url)
            logger.warning(res)
            connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(res, default=lambda x: str(x)))
            
            polylines = {}
            for i in range(0, len(stop_ids) - 1):
                coordinates = [stop_coordinates[i],
                                stop_coordinates[i + 1]]
                leg_polyline = polyline.encode(coordinates, geojson=True)
                leg_durations_frac = [1.0]
                polylines[stop_ids[i]] = (leg_polyline, leg_durations_frac)

    return polylines

#Event
def __init__(self, event_name, queue, event_time=None, event_priority=5,
                index=None):
    self.__name = event_name
    self.__queue = queue
    self.__index = index
    logger = logging.getLogger(__name__)
    if event_time is None:
        self.__time = self.__queue.env.current_time
    elif event_time < self.__queue.env.current_time:
        self.__time = self.__queue.env.current_time
        logger.warning(
            "WARNING: {}: event_time ({}) is smaller than current_time ("
            "{})".format(self.name, event_time,
                            self.__queue.env.current_time))
        connection.send(ConnectionCredentials.INFO_QUEUE, body="WARNING: {}: event_time ({}) is smaller than current_time ("
            "{})".format(self.name, event_time,
                            self.__queue.env.current_time))
        
    elif event_time > self.MAX_DELTA_TIME:
        logger.warning(
            "WARNING: {}: event_time ({}) is much larger than "
            "current_time ({})".format(self.name, event_time,
                                        self.__queue.env.current_time))
        connection.send(ConnectionCredentials.INFO_QUEUE, body=
            "WARNING: {}: event_time ({}) is much larger than "
            "current_time ({})".format(self.name, event_time,
                                        self.__queue.env.current_time))
    else:
        self.__time = event_time

    if event_priority < 0:
        raise ValueError("The parameter event_priority must be positive!")

    if event_priority > self.MAX_PRIORITY:
        event_priority = self.MAX_PRIORITY
        logger.warning(
            "event_priority ({}) must be smaller than MAX_PRIORITY ({})"
            .format(event_priority, self.MAX_PRIORITY))
        connection.send(ConnectionCredentials.INFO_QUEUE, body=
            "event_priority ({}) must be smaller than MAX_PRIORITY ({})"
            .format(event_priority, self.MAX_PRIORITY))

    self.__priority = 1 - 1 / (1 + event_priority)


#TravelTimes
def get_expected_arrival_time(self, from_stop, to_stop, vehicle):
    logger = logging.getLogger(__name__)
    logger.warning("{}: {} -> {}".format(vehicle.id, str(from_stop.location), str(to_stop.location)))
    connection.send(ConnectionCredentials.INFO_QUEUE, body="{}: {} -> {}".format(vehicle.id, str(from_stop.location), str(to_stop.location)))
    
    logger.warning("{}: {} -> {}".format(type(vehicle.id), type(from_stop.location),
                                            type(to_stop.location)))
    connection.send(ConnectionCredentials.INFO_QUEUE, body="{}: {} -> {}".format(type(vehicle.id), type(from_stop.location),
                                            type(to_stop.location)))
    
    logger.warning(self.__times_matrix[vehicle.id])
    connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(self.__times_matrix[vehicle.id], default=lambda x:str(x)))
    
    logger.warning(self.__times_matrix[vehicle.id][str(from_stop.location)])
    connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(self.__times_matrix[vehicle.id][str(from_stop.location)]))
    
    logger.warning(self.__times_matrix[vehicle.id][str(from_stop.location)][str(to_stop.location)])
    connection.send(ConnectionCredentials.INFO_QUEUE, body=json.dumps(self.__times_matrix[vehicle.id][str(from_stop.location)][str(to_stop.location)]))

    travel_time = \
        self.__times_matrix[vehicle.id][str(from_stop.location)][
            str(to_stop.location)]
    arrival_time = from_stop.departure_time + travel_time

    return arrival_time

def setup():
    #TODO
    pass
    # GTFSReader.get_network_graph = get_network_graph
    # MatrixTravelTimesReader.get_matrix_travel_times = get_matrix_travel_times
    # CoordinatesOSRM.__extract_polylines_from_response = __extract_polylines_from_response
    # CoordinatesOSRM.update_polylines = update_polylines
    # Event.__init__ = __init__
    # MatrixTravelTimes.get_expected_arrival_time = get_expected_arrival_time