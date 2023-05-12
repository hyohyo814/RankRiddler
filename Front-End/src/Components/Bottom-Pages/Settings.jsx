import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

const Settings = () => {
  const [userId, setUserId] = useState(() => Cookies.get('userId') || uuidv4());
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(-1);
  const [username, setUsername] = useState(Cookies.get('username') || 'Guest');
  const [isUsernameChanged, SetisUsernameChanged] = useState(false);
  const [score, setScore] = useState(0);

  console.log(isUsernameChanged);
  useEffect(() => {
    if (!userId) {
      const id = uuidv4();
      const shortUuid = id.slice(0, 8);
      Cookies.set('userId', shortUuid, { secure: true });
      setUserId(shortUuid);
    }
    const storedUsername = Cookies.get('username') || 'Guest';
    setUsername(storedUsername);
    SetisUsernameChanged(storedUsername !== 'Guest');
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/allusers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const userData = await response.json();
        setData(userData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const foundUser = data.find((user) => user.username === username);
    if (foundUser) {
      setIndex(data.indexOf(foundUser));
    } else {
      setIndex(-1);
    }
  }, [username, data]);

  const saveUser = async (username) => {
    try {
      const response = await fetch('http://localhost:3001/saveuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
        }),
        credentials: 'include', // include cookies in the request
      });
      const data = await response.json();
      setScore(data.points);
      setUsername(data.username);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const usernameReset = () => {
    if (isUsernameChanged) {
      return;
    }
    let newUsername = prompt('Please enter a new username');
    const checkUsername = async () => {
      if (newUsername === null || newUsername === '') {
        newUsername = prompt('Please enter a new username');
        checkUsername();
      }
      const newUser = await saveUser(newUsername);
      if (newUser.error) {
        newUsername = prompt(newUser.error);
        checkUsername();
      }
    };
    checkUsername();
  };

  return (
    <>
      <div className="settings-container">
        <p>
          Current ID:{' '}
          <span>
            <u>{userId}</u>
          </span>
        </p>
        <p>
          Current User: <span>{username}</span>
        </p>
        <p>
          Current Score: <span>{score}</span>
        </p>
        <p>
          Current Rank: <span>#{index === -1 ? 'N/A' : index + 1}</span>
        </p>
        <div className="reset-container">
          {isUsernameChanged ? null : (
            <div>
              <p>Must set a username to see your leaderboard rank</p>
              <br />
              <h5>
                Can only be changed
                <span style={{ color: '#e34234' }}>
                  <u>ONCE</u>
                </span>
              </h5>
              <p>
                <span className="reset-text" onClick={usernameReset}>
                  Change
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
