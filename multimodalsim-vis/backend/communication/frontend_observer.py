from multimodalsim.observer.environment_observer import EnvironmentObserver
from multimodalsim.observer.data_collector import DataContainer
from multimodalsim.statistics.data_analyzer import FixedLineDataAnalyzer

from frontend_visualizer import FrontendVisualizer
from frontend_data_collector import FrontendDataCollector
class FrontendEnvironmentObserver(EnvironmentObserver):
    def __init__(self):
        data_container = DataContainer()
        super().__init__(
            data_collectors=FrontendDataCollector(data_container),
            visualizers=FrontendVisualizer(data_analyzer=FixedLineDataAnalyzer(data_container))
        )