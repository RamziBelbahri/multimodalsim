from stomp import Connection11

class ActiveMQController:
	connection = None
	def __init__(self) -> None:
		pass
	
	def getConnection(user='admin',password='admin',host='0.0.0.0',port=61613):
		if ActiveMQController.connection == None:
			ActiveMQController.connection = Connection11([(host, port)])  
			ActiveMQController.connection.connect(user, password)
		return ActiveMQController.connection

if __name__ == '__main__':
	a = ActiveMQController().getConnection()
	a.send("/queue/server", body="yooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo")