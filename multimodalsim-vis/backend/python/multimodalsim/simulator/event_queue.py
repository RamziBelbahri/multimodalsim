from queue import PriorityQueue


class EventQueue(object):
    def __init__(self, env):
        self.__queue = PriorityQueue()

        self.__index = 0

        self.__env = env

    @property
    def env(self):
        return self.__env

    def is_empty(self):
        """check if the queue is empty"""
        return self.__queue.empty()

    def put(self, event):
        """add an element in the queue"""
        event.index = self.__index
        self.__queue.put(event)
        self.__index += 1

    def pop(self):
        """pop an element based on Priority time"""
        return self.__queue.get()

    def is_event_type_in_queue(self, event_type, time):
        is_in_queue = False
        for event in self.__queue.queue:
            if event.time == time and isinstance(event, event_type):
                is_in_queue = True
                break

        return is_in_queue
