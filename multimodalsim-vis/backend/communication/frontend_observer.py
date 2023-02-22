from multimodalsim.observer.environment_observer import EnvironmentObserver
from multimodalsim.observer.data_collector import StandardDataCollector, DataContainer
from multimodalsim.statistics.data_analyzer import FixedLineDataAnalyzer

from frontend_visualizer import FrontendVisualizer

class FrontendEnvironmentObserver(EnvironmentObserver):
    def __init__(self):
        data_container = DataContainer()
        super().__init__(
            data_collectors=StandardDataCollector(data_container),
            visualizers=FrontendVisualizer(data_analyzer=FixedLineDataAnalyzer(data_container))
        )