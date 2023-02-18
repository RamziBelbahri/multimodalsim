from multimodalsim.config.config import Config

import os


class SimulationConfig(Config):
    def __init__(self, config_file=os.path.join(os.path.dirname(__file__),
                                                "ini/simulation.ini")):
        super().__init__(config_file)

    @property
    def speed(self):
        return int(self._config_parser["time_sync_event"]["speed"])

    @property
    def time_step(self):
        return int(self._config_parser["time_sync_event"]["time_step"])

    @property
    def update_position_time_step(self):
        return int(self._config_parser["update_position_event"]["time_step"])

    @property
    def max_time(self):
        if len(self._config_parser["general"]["max_time"]) == 0:
            max_time = None
        else:
            max_time = float(self._config_parser["general"]["max_time"])

        return max_time
