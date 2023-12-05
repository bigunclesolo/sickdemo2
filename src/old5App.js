import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation } from "aws-amplify";
import { Button, Flex, Heading, Text, View, withAuthenticator } from "@aws-amplify/ui-react";
import { listDemoprojtables } from './graphql/queries';
import { updateDemoprojtable } from './graphql/mutations';

const App = ({ signOut }) => {
  const [demoprojData, setDemoprojData] = useState([]); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [time2, setTime2] = useState(12.38);
  const [finalTime2Count, setFinalTime2Count] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Fetch data from the API
  async function fetchData() {
    const apiData = await API.graphql({ query: listDemoprojtables });
    setDemoprojData(apiData.data.listDemoprojtables.items);
  }

  // Function to handle 60 seconds condition
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

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1); 
        setTime2(prev => prev + 1);
      }, 1000);
    } else if (finalTime2Count === null) {
      setFinalTime2Count(time2);
    }
    return () => clearInterval(interval); 
  }, [isTimerRunning, time2, finalTime2Count]);

  // Fetch data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(); 
    }, 5000);

    return () => clearInterval(interval);
  }, []) 

  // Effect for checking the latest item in the data
  useEffect(() => {
    const latestItem = demoprojData[demoprojData.length - 1];
    if(latestItem?.time === 'start') {
      setIsTimerRunning(true);
      setFinalTime2Count(null); // Reset finalTime2Count on restart
    } else if (latestItem?.time === 'stop') {
      setIsTimerRunning(false);
      setFinalTime2Count(time2); // Store the last time2 value
    }
  }, [demoprojData, time2]);

  // Effect for handling 60 seconds condition
  useEffect(() => {
    if(time >= 60) {
      SixtyTrue();
    } else {
      SixtyFalse(); 
    }
  }, [time]);

  // Function to determine the status color
  function getStatusColor(item) {
    switch (item.status) {
      case 1:
        return 'green';
      case 2:
        return 'yellow';
      case 3:
        return 'red';
      default:
        return 'grey';
    }
  }

  // Format date and time
  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', { hour12: true });
  };

  // Update the current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View className="App">
      <Flex direction="row" justifyContent="space-between" backgroundColor="white">
        <Flex direction="column" width="20%" padding="1rem" backgroundColor="white">
          <Text fontWeight="bold" color={"#2e73b8"}>Facility Statistics</Text>
          <Text fontWeight="bold" backgroundColor="#2e73b8" color="white">Shipping Sorter</Text>
          <Text fontWeight="bold">Receiving Sorter</Text>
          <Text fontWeight="bold">Crossbelt Sorter 1</Text>
          <Text fontWeight="bold">Crossbelt Sorter 2</Text>
          <Button onClick={signOut} marginTop="auto">Sign Out</Button>
        </Flex>

        <Flex direction="column" width="80%" padding="1rem">
          <Heading level={1}>ACME Inc.</Heading>
          <Text>Distribution Center: San Bernardino, CA</Text>

          <Flex direction="row" justifyContent="center" backgroundColor="#2e73b8">
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Lane Description</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Lane Status</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Initial SMS</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Escalation SMS</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Response Time</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Lane Losses</Text>
            <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>Final Losses</Text>
          </Flex>

          <Flex direction="column" width="80%" padding="1rem">
            {demoprojData.map((item, index) => (
              <Flex key={index} direction="row" justifyContent="center" backgroundColor={getStatusColor(item)}>
                <Text width="16.66%" padding="0.5rem" backgroundColor={getStatusColor(item)}>{`Take-away #${item.id} Pallet Build`}</Text>
                <Text width="16.66%" padding="0.5rem">{time}</Text>
                <Text width="16.66%" padding="0.5rem">{isTimerRunning ? 'true' : 'false'}</Text>
                <Text width="16.66%" padding="0.5rem" fontWeight="bold" color={"white"}>{time >= 60 ? 'true' : 'false'}</Text>
                <Text width="16.66%" padding="0.5rem">{time2}</Text>
                <Text width="16.66%" padding="0.5rem">{finalTime2Count !== null ? finalTime2Count : item.finalLosses}</Text>
              </Flex>
            ))}
          </Flex>

          <Flex justifyContent="center" backgroundColor="white">
            <Text padding="0.5rem">{formatDateTime(currentDateTime)}</Text>
          </Flex>
        </Flex>
      </Flex>
    </View>
  );
};

export default withAuthenticator(App);
