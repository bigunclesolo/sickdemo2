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
  const [time, setTime] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [laneLosses, setLaneLosses] = useState(12.38);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  async function fetchData() {
    const apiData = await API.graphql(graphqlOperation(listDemoprojtables));
    setDemoprojData(apiData.data.listDemoprojtables.items);
  }

  const SixtyTrue = async () => {
    const input = {
      id: '1',
      sixty: true,
      status: '3'
    };
    await API.graphql(graphqlOperation(updateDemoprojtable, { input }));
  }

  const SixtyFalse = async () => {
    const input = {
      id: '1',
      sixty: false
    };
    await API.graphql(graphqlOperation(updateDemoprojtable, { input }));
  }

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isTimerRunning && time !== 0) {
      setLaneLosses(prev => prev + time);
      setLastTime(time);
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, time]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const latestItem = demoprojData[demoprojData.length - 1];
    if (latestItem?.time === 'start') {
      setIsTimerRunning(true);
    } else if (latestItem?.time === 'stop') {
      setIsTimerRunning(false);
    }
  }, [demoprojData]);

  useEffect(() => {
    if (time >= 60) {
      SixtyTrue();
    } else {
      SixtyFalse();
    }
  }, [demoprojData, time]);

  function getStatusColor(status) {
    switch (status) {
      case 1:
        return { backgroundColor: 'green', color: 'white' };
      case 2:
        return { backgroundColor: 'yellow', color: 'black' }; 
      case 3:
        return { backgroundColor: 'red', color: 'black' }; 
      default:
        return { backgroundColor: 'gray', color: 'white' };
    }
  }  

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', { hour12: true });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App">
      <div className="sidebar">
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
          <div className="grid-header">Lane Description</div>
          <div className="grid-header">Lane Status</div>
          <div className="grid-header">Initial SMS</div>
          <div className="grid-header">Escalation SMS</div>
          <div className="grid-header">Response Time</div>
          <div className="grid-header">Lane Losses</div>
          {demoprojData.map((item, index) => (
            <React.Fragment key={index}>
              <div className="grid-cell" style={getStatusColor(item.status)}>
                {`Take-away #${item.id} Pallet Build`}
              </div>
              <div className="grid-cell">{item.status ? time : 'N/A'}</div>
              <div className="grid-cell">{isTimerRunning ? 'Sent' : 'Not Sent'}</div>
              <div className="grid-cell">{time === 60 ? 'Sent' : 'Not Sent'}</div>
              <div className="grid-cell">{lastTime}</div>
              <div className="grid-cell">{laneLosses.toFixed(2)}</div>
            </React.Fragment>
          ))}
          {/* Static dummy rows */}
          {[...Array(9)].map((_, index) => (
            <React.Fragment key={`static-row-${index}`}>
              <div className="grid-cell" style={{ backgroundColor: 'green', color: 'white' }}>
                Take-away #{index + 2} Pallet Build
              </div>
              <div className="grid-cell">0</div>
              <div className="grid-cell">Not Sent</div>
              <div className="grid-cell">Not Sent</div>
              <div className="grid-cell">0</div>
              <div className="grid-cell">12.38</div>
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