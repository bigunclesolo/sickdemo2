import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listDemoprojtables } from './graphql/queries';
import { updateDemoprojtable } from './graphql/mutations';
//test
const App = ({ signOut }) => {

const [demoprojData, setDemoprojData] = useState([]); 
const [isTimerRunning, setIsTimerRunning] = useState(false);
const [time, setTime] = useState(0);
const [time2, setTime2] = useState(12.38);
const [finalTime2Count, setFinalTime2Count] = useState(null);
const lastTime = null;

async function fetchData() {
  const apiData = await API.graphql({ query: listDemoprojtables });
  setDemoprojData(apiData.data.listDemoprojtables.items);
}

const SixtyTrue = async () => {
  const input = {
    id: '1',
    sixty: true,
    status: '3'
  };
  return API.graphql(graphqlOperation(updateDemoprojtable, {input}));
}

const SixtyFalse = async () => {
  const input = {
    id: '1',
    sixty: false
  };
  return API.graphql(graphqlOperation(updateDemoprojtable, {input}));
}

useEffect(() => {
  if (isTimerRunning) {
    const interval = setInterval(() => {
      setTime(prev => prev + 1); 
      setTime2(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval); 
  }
}, [isTimerRunning]);

useEffect(() => {
  const interval = setInterval(() => {
    fetchData(); 
  }, 1000);

return () => clearInterval(interval);
}, []) 

useEffect(() => {
  if (!isTimerRunning && time2 !== 12.38) {
    setFinalTime2Count(time2);
  }
}, [isTimerRunning, time2]);

useEffect(() => {
  const latestItem = demoprojData[demoprojData.length - 1];
  if(latestItem?.time === 'start') {
    setIsTimerRunning(true);
  } else if (latestItem?.time === 'stop') {
    const lastTime = time2;
    setIsTimerRunning(false);
  }
}, [demoprojData]);

useEffect(() => {
  if(time >= 60) {
    SixtyTrue();

  } else{
    SixtyFalse(); 
  }
}, [time]);



function getStatusColor(item) {
  if(item.status === 1) {
    return 'green';
  } else if (item.status === 2) {
   return 'yellow';
  } else if (item.status === 3) {
   return 'red'; 
  }
  return 'grey';
}
  

  return (
    <View className="App">
      <Heading level={1}>Sensor Demo Dashboard</Heading>
      <Flex direction="row" justifyContent="center">
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Lane #
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">  
          Lane Status
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Initial SMS 
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Escalation SMS
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Response Time 
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Lane Losses
        </View>
        <View as="header" width="16.66%" padding="0.5rem" backgroundColor="lightgrey">
          Final Loss
        </View>
      </Flex>
      <Flex direction="row" justifyContent="center">
      {demoprojData.map(item => (
        <View width="16.66%" padding="1rem" backgroundColor="grey">
          {item.id.toString()}
        </View>
      ))}
      {demoprojData.map(item => (
        <View 
          width="16.66%" 
          padding="1rem"
          backgroundColor={getStatusColor(item)}>
        </View>
      ))}
      {demoprojData.map(item => (
        <View width="16.66%" padding="1rem" backgroundColor="grey">  
          {item.sms.toString()}
        </View>
      ))}
       {demoprojData.map(item => (
        <View width="16.66%" padding="1rem" backgroundColor="grey">  
          {item.sixty.toString()}
        </View>
      ))}
      <View width="16.66%" padding="1rem" backgroundColor="grey">
      {isTimerRunning && <Text>{time}</Text>} 
      </View>
      <View width="16.66%" padding="1rem" backgroundColor="grey">
        {isTimerRunning && <Text>{time2}</Text>} 
      </View>
      <View width="16.66%" padding="1rem" backgroundColor="grey">
      {finalTime2Count ?? <Text>{time2}</Text>} 
      </View>
      </Flex>
      <Heading level={2}></Heading>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);