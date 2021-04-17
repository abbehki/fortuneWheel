import React from "react";


const ButtonUI = (props) => {
    return <button
    type="button"
    id="spin"
    onTouchStart={props.spin}
    onClickCapture={props.spin}
  >
    {props.children}
  </button>

  };
  export default ButtonUI;