import React from "react";


const ProgessBar = (props) => {
    return <div id="myProgress">
    <div id="myBar" style={{width:`${props.spinGauge}%`}}></div>
  </div>

  };
  export default ProgessBar;