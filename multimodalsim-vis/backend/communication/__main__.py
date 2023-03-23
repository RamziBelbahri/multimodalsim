import argparse
import logging
import cProfile
import pstats

import networkx as nx
from communication.active_mq_controller import ActiveMQController
from communication.connection_credentials import ConnectionCredentials 
from communication.frontend_observer import FrontendEnvironmentObserver
from communication.frontend_visualizer import FrontendVisualizer

from multimodalsim.shuttle.shuttle_greedy_dispatcher import \
    ShuttleGreedyDispatcher

from multimodalsim.logger.formatter import ColoredFormatter
from multimodalsim.observer.environment_observer import \
    StandardEnvironmentObserver
from multimodalsim.simulator.coordinates import CoordinatesOSRM, \
    CoordinatesFromFile
from multimodalsim.optimization.dispatcher import FixedLineDispatcher
from multimodalsim.optimization.optimization import Optimization
from multimodalsim.optimization.splitter import OneLegSplitter, MultimodalSplitter
from multimodalsim.reader.data_reader import BusDataReader, GTFSReader, ShuttleDataReader
from multimodalsim.simulator.network import create_graph
from multimodalsim.simulator.simulation import Simulation

logger = logging.getLogger(__name__)

#
def add_arguments(parser):
    parser.add_argument("-r", "--requests", help="path to the file "
                                                 "containing the requests")
    parser.add_argument("-v", "--vehicles", help="path to the file "
                                                 "containing the vehicles")
    parser.add_argument("-n", "--nodes", help="path to the file containing "
                                              "the nodes (with 'shuttle' "
                                              "only)")
    parser.add_argument("type", help="type of optimization ('shuttle' or "
                                     "'fixed')")
    parser.add_argument("--log-level",
                        help="the log level (by default: DEBUG)",
                        default="DEBUG")
    parser.add_argument("--gtfs", help="input files are in the GTFS format",
                        action="store_true")
    parser.add_argument("--gtfs-folder", help="the path to the folder "
                                              "containing the files in the "
                                              "GTFS format")
    parser.add_argument("--multimodal", help="fixed line optimization is "
                                             "multimodal", action="store_true")
    parser.add_argument("-c", "--connections", help="path to the file "
                                                    "containing the available "
                                                    "connections")
    parser.add_argument("-g", "--graph", help="path to the file containing the"
                                              " network graph object")
    parser.add_argument("--coord", help="path to the file containing the"
                                        " coordinates")
    parser.add_argument("--osrm", help="retrieve vehicle coordinates from "
                                       "OSRM", action="store_true")


def check_arguments(args):
    if args.type != "fixed":
        raise ValueError("The type of optimization must be 'fixed'!")
    elif (args.type == "fixed") and args.requests is None:
        raise ValueError("Shuttle optimization requires the path to the "
                         "requests (--requests)!")
    elif (args.type == "fixed") and (args.vehicles is None and not args.gtfs):
        raise ValueError("the path to the vehicles (--vehicles) is required!")

    numeric_log_level = getattr(logging, args.log_level.upper(), None)
    if not isinstance(numeric_log_level, int):
        raise ValueError("The argument --log-level is invalid: {}"
                         .format(args.log_level))


def configure_logger(log_level=logging.INFO, log_filename=None):
    logger.info("log_level={}".format(log_level))
    logging.basicConfig(filename=log_filename, level=log_level)
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Replace default handler with custom handler
    console_stream_handler = logging.StreamHandler()
    console_stream_handler.setFormatter(ColoredFormatter())
    # Add fmt="%(message)s" as argument of ColoredFormatter if you only want
    # to see the output (without time and line numbers).

    root_logger = logging.getLogger()

    # Remove default handler
    for h in root_logger.handlers:
        root_logger.removeHandler(h)

    # Add custom handler
    root_logger.addHandler(console_stream_handler)

    # Add file handler
    if log_filename is not None:
        root_logger.addHandler(logging.FileHandler(log_filename, mode='w'))

    root_logger.info("log_level={}".format(log_level))


def main():
    parser = argparse.ArgumentParser()
    add_arguments(parser)
    args = parser.parse_args()

    check_arguments(args)

    # log_filename = "log.txt"
    log_filename = None
    configure_logger(log_level=args.log_level, log_filename=log_filename)

    requests_file_path = args.requests
    vehicles_file_path = args.vehicles

    g = None

    if args.type == "fixed":
        logger.info("FixedLine")

        if args.gtfs:
            # Parameters example: fixed --gtfs --gtfs-folder
            # ../../data/fixed_line/gtfs/gtfs/ -r
            # ../../data/fixed_line/gtfs/requests_gtfs_v1.csv --multimodal
            # --log-level DEBUG
            data_reader = GTFSReader(args.gtfs_folder, requests_file_path)
            # RTC: fixed --gtfs --gtfs-folder ../../data/fixed_line/gtfs_rtc/ -r ../../data/fixed_line/requests_gtfs_rtc/small_requests.csv --log-level INFO
            # STL: fixed --gtfs --gtfs-folder ../../data/fixed_line/stl/gtfs/generated/2019-11-01/ -r ../../data/fixed_line/stl/gtfs/generated/2019-11-01/day_requests.csv --log-level INFO

        else:
            # Parameters example: fixed -r
            # ../../data/fixed_line/bus/requests_v1.csv -v
            # ../../data/fixed_line/bus/vehicles_v1.csv --multimodal
            # --log-level DEBUG
            data_reader = BusDataReader(requests_file_path, vehicles_file_path)

        # -c ../../data/fixed_line/stl/available_connections/available_connections_0p25.json
        # -g ../../data/fixed_line/stl/network_graph/bus_network_graph_20191101.txt
        logger.info("Available connections file: {}".format(
            args.connections))
        if args.connections is not None:
            available_connections = data_reader.get_available_connections(
                args.connections)
        else:
            # Connections between different stops is impossible.
            available_connections = []

        if args.graph:
            g = nx.read_gpickle(args.graph)
        else:
            logger.info("Generate network graph...")
            g = data_reader.get_network_graph(
                available_connections=available_connections)
            g_path = "../../data/fixed_line/stl/network_graph/" \
                     "bus_network_graph_20191103.txt"
            nx.write_gpickle(g, g_path)

        if args.multimodal:
            splitter = MultimodalSplitter(
                network_graph=g, available_connections=available_connections)
        else:
            splitter = OneLegSplitter()
        dispatcher = FixedLineDispatcher()
    else:
        raise ValueError("The type of optimization must be 'fixed'!")

    opt = Optimization(dispatcher, splitter)

    vehicles = data_reader.get_vehicles()
    trips = data_reader.get_trips()

    environment_observer = FrontendEnvironmentObserver()

    if args.coord:
        logger.info("Coordinates from {}".format(args.coord))
        coordinates = CoordinatesFromFile(args.coord)
    elif args.osrm:
        logger.info("Coordinates from OSRM")
        coordinates = CoordinatesOSRM()
    else:
        logger.info("No coordinates")
        coordinates = None

    simulation = Simulation(opt, trips, vehicles, network=g,
                            environment_observer=environment_observer,
                            coordinates=coordinates)
    simulation.simulate()
    ActiveMQController().getConnection().send(ConnectionCredentials.ENTITY_EVENTS_QUEUE, body=ConnectionCredentials.SIMULATION_COMPLETED)
    

if __name__ == '__main__':
    logger.info("MAIN")

    main()
    
