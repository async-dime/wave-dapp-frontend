import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Toast.css';

const Toast = (props) => {
  Toast.propTypes = {
    toastList: PropTypes.array.isRequired,
    position: PropTypes.string,
  };
  const { toastList, position } = props;
  const [list, setList] = useState(toastList);
  const dismissTime = 3000;

  const deleteToast = (id) => {
    const index = list.findIndex((e) => e.id === id);
    list.splice(index, 1);
    setList([...list]);
  };

  useEffect(() => {
    setList(toastList);
  }, [toastList, list]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (toastList.length && list.length) {
        deleteToast(toastList[0].id);
      }
    }, dismissTime);

    return () => {
      clearInterval(interval);
    };

    // eslint-disable-next-line
  }, [toastList, dismissTime, list]);

  return (
    <>
      <div className={`notification-container ${position}`}>
        {list.map((toast, i) => {
          return (
            <div
              key={i}
              className={`notification toast ${position}`}
              style={{ backgroundColor: toast.backgroundColor }}
              onClick={() => {
                deleteToast(toast.id);
              }}
            >
              <div className="notification-image">
                <img src={toast.icon} alt="" />
              </div>
              <div>
                <p className="notification-title">{toast.title}</p>
                <p className="notification-message">{toast.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Toast;
