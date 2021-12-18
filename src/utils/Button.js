import React from 'react';
import PropTypes from 'prop-types';

const Button = props => {
    const { label, className, handleClick, disabled } = props;
    return (
        <>
            <button 
                className={className}
                onClick={handleClick}
                disabled={disabled}
            >
                {label}
            </button>
        </>
    );
}

Button.propTypes = {
    label: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    handleClick: PropTypes.func,
    disabled: PropTypes.bool,
}

export default Button;