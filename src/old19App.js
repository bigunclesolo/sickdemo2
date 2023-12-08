import React, { useState, useEffect } from "react";
import "./App.css";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { listDemoprojtables } from './graphql/queries';
import { updateDemoprojtable } from './graphql/mutations';

const App = ({ signOut }) => {
  const [demoprojData, setDemoprojData] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [time2, setTime2] = useState(12.38);
  const [finalTime2Count, setFinalTime2Count] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  async function fetchData() {
    try {
      const apiData = await API.graphql(graphqlOperation(listDemoprojtables));
      setDemoprojData(apiData.data.listDemoprojtables.items);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const input = {
        id: id.toString(),
        status: newStatus.toString(),
        // Add additional properties to update as necessary
      };
      await API.graphql(graphqlOperation(updateDemoprojtable, { input }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTime(prevTime => {
          const updatedTime = prevTime + 1;
          if (updatedTime === 60) {
            // Update the status of the item to '3' when time reaches 60 seconds
            updateStatus('1', 3); // Replace '1' with your actual item id
          }
          return updatedTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning]);

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const latestItem = demoprojData[demoprojData.length - 1];
    if (latestItem?.time === 'start') {
      setIsTimerRunning(true);
      setFinalTime2Count(null);
      updateStatus(latestItem.id, 2); // Update status to '2' when timer starts
    } else if (latestItem?.time === 'stop') {
      setIsTimerRunning(false);
      setFinalTime2Count(time2);
    }
  }, [demoprojData, time2]);

  function getStatusColor(status) {
    switch (status) {
      case '1':
        return 'green'; // Default or initial status
      case '2':
        return 'yellow'; // When the counter starts
      case '3':
        return 'red'; // When timer1 reaches 60 seconds
      default:
        return 'green'; // Default color if status is not 1, 2, or 3
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
              <div className="grid-cell" style={{ backgroundColor: getStatusColor(Number(item.status)) }}>
                {`Take-away #${item.id} Pallet Build`}
              </div>
              <div className="grid-cell">{time}</div>
              <div className="grid-cell">{isTimerRunning ? 'true' : 'false'}</div>
              <div className="grid-cell">{time >= 59 ? 'true' : 'false'}</div>
              <div className="grid-cell">{time2}</div>
              <div className="grid-cell">{finalTime2Count !== null ? finalTime2Count : 'N/A'}</div>
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