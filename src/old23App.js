import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { listDemoprojtables } from './graphql/queries';
import { updateDemoprojtable } from './graphql/mutations';

const App = ({ signOut }) => {
  const [demoprojData, setDemoprojData] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0); // Time for lane status
  const [lastTime, setLastTime] = useState(0); // To store the last time value
  const [laneLosses, setLaneLosses] = useState(12.38); // Starting from 12.38
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
      }, 1000);
    } else {
      setLaneLosses(prev => prev + lastTime); // Update Lane Losses
      setTime(0); // Reset time
      setLastTime(0); // Reset last time
    }
    return () => clearInterval(interval); 
  }, [isTimerRunning, time, lastTime]); // Including lastTime in dependency array

  // Fetch data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(); 
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Effect for checking the latest item in the data
  useEffect(() => {
    const latestItem = demoprojData[demoprojData.length - 1];
    if (latestItem?.time === 'start') {
      setIsTimerRunning(true);
    } else if (latestItem?.time === 'stop') {
      setIsTimerRunning(false);
      setLastTime(time); // Set last time when timer stops
    }
  }, [demoprojData, time]);

  // Effect for handling 60 seconds condition
  useEffect(() => {
    if (time >= 60) {
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
        return 'green';
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
    <div className="App">
      <div className="sidebar">
        {/* Sidebar content */}
        <div className="sidebar-item" style={{ fontWeight: 'bold', color: '#2e73b8' }}>Facility Statistics</div>
        <div className="sidebar-item active">Shipping Sorter</div>
        <div className="sidebar-item">Receiving Sorter</div>
        <div className="sidebar-item">Crossbelt Sorter 1</div>
        <div className="sidebar-item">Crossbelt Sorter 2</div>
        <button onClick={signOut} className="sign-out-button">Sign Out</button>
      </div>
      <div className="main-content">
        <h1>ACME Inc.</h1>
        <div>Distribution Center: San Bernardino, CA</div>
        <div className="grid-container">
          {/* Grid Headers */}
          <div className="grid-header">Lane Description</div>
          <div className="grid-header">Lane Status</div>
          <div className="grid-header">Initial SMS</div>
          <div className="grid-header">Escalation SMS</div>
          <div className="grid-header">Response Time</div>
          <div className="grid-header">Lane Losses</div>
          {/* Grid Rows */}
          {demoprojData.map((item, index) => (
            <React.Fragment key={index}>
              <div className="grid-cell" style={{ backgroundColor: getStatusColor(item.status), color: 'white' }}>
                {`Take-away #${item.id} Pallet Build`}
              </div>
              <div className="grid-cell">{time}</div>
              <div className="grid-cell">{isTimerRunning ? 'true' : 'false'}</div>
              <div className="grid-cell">{time >= 60 ? 'true' : 'false'}</div>
              <div className="grid-cell">{lastTime}</div>
              <div className="grid-cell">{laneLosses}</div>
            </React.Fragment>
          ))}
        </div>
        <div className="time-display">
          {formatDateTime(currentDateTime)}
        </div>
      </div>
    </div>
  );
};
  
  export default withAuthenticator(App);  
