from stomp import Connection11
from communication.connection_credentials import ConnectionCredentials
class ActiveMQController:
	connection = None
	def __init__(self) -> None:
		pass

	def getConnection(user=ConnectionCredentials.USERNAME,password=ConnectionCredentials.PASSWORD, host=ConnectionCredentials.LOCALHOST, port=ConnectionCredentials.PORT):
		if ActiveMQController.connection == None:
			ActiveMQController.connection = Connection11([(host, port)])  
			ActiveMQController.connection.connect(user, password)
		return ActiveMQController.connection

if __name__ == '__main__':
	testConnection = ActiveMQController().getConnection()
	testConnection.send("/queue/server", body="testmessage")