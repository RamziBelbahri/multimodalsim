from stomp import Connection11
from connection_credentials import ConnectionCredentials
class ActiveMQController:
	connection = None
	def __init__(self) -> None:
		pass
	
	def getConnection(user=ConnectionCredentials.USERNAME,password=ConnectionCredentials.PASSWORD, host=ConnectionCredentials.HOST, port=ConnectionCredentials.PORT):
		if ActiveMQController.connection == None:
			ActiveMQController.connection = Connection11([(host, port)])  
			ActiveMQController.connection.connect(user, password)
		return ActiveMQController.connection

if __name__ == '__main__':
	a = ActiveMQController().getConnection()
	a.send("/queue/server", body="yooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo")