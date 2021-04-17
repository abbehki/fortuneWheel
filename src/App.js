import React from "react";
import ZingTouch from 'zingtouch';
import axios from 'axios';

import "./App.css";
import Header from "./header";
import ProgessBar from "./progessBar";
import ButtonUI from "./buttonUI";
import CardView from "./cardView";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: ["10", "150", "0", "99", "0", "Trip", "500", "Discount"],
      radius: 75, // PIXELS
      rotate: 0, // DEGREES
      easeOut: 0, // SECONDS
      angle: 0, // RADIANS
      top: null, // INDEX
      offset: null, // RADIANS
      net: null, // RADIANS
      result: null, // INDEX
      spinning: false,
      spinGauge:0
    };
  }

  ApiService=()=>{
    let dataRequest={
      web_client:'Abhay',
      timestamp : Date.now(),
      spin_result_index:this.state.result
    }
    axios.post('https://sheet.best/api/sheets/5236e5f0-c611-49d6-bdce-df40f956c289', dataRequest)
    .then(response => {
      console.log(response);
    })
  }

  componentDidMount() {
    // generate canvas wheel on load
    this.renderWheel();
    let currentAngle=15
    let target = document.getElementsByClassName('wheel-rotator')[0];
    let region = new ZingTouch.Region(target);  
    let self=this;
    region.bind(target, 'rotate', function(e) {
      var rotatable = document.getElementById('wheel');
      currentAngle += e.detail.distanceFromLast;
      rotatable.style.transform = 'rotate(' + currentAngle + 'deg)';
      if(e.detail.distanceFromLast > 0){
        self.setState({ spinGauge: self.state.spinGauge - 0.1 });
      }else{
        self.setState({ spinGauge: self.state.spinGauge + 0.1 });
      }
    });
    document.getElementById('wheel').addEventListener("mouseup", function() {
      self.spin()
    });
    document.getElementById('wheel').addEventListener("touchend", function() {
      self.spin()
    });
  }

  

  renderWheel() {
    // determine number/size of sectors that need to created
    let numOptions = this.state.list.length;
    let arcSize = (2 * Math.PI) / numOptions;
    this.setState({
      angle: arcSize
    });

    // get index of starting position of selector
    this.topPosition(numOptions, arcSize);

    // dynamically generate sectors from state list
    let angle = 0;
    for (let i = 0; i < numOptions; i++) {
      let text = this.state.list[i];
      this.renderSector(i + 1, text, angle, arcSize, this.getColor());
      angle += arcSize;
    }
  }

  topPosition = (num, angle) => {
    // set starting index and angle offset based on list length
    // works upto 9 options
    let topSpot = null;
    let degreesOff = null;
    if (num === 9) {
      topSpot = 7;
      degreesOff = Math.PI / 2 - angle * 2;
    } else if (num === 8) {
      topSpot = 6;
      degreesOff = 0;
    } else if (num <= 7 && num > 4) {
      topSpot = num - 1;
      degreesOff = Math.PI / 2 - angle;
    } else if (num === 4) {
      topSpot = num - 1;
      degreesOff = 0;
    } else if (num <= 3) {
      topSpot = num;
      degreesOff = Math.PI / 2;
    }

    this.setState({
      top: topSpot - 1,
      offset: degreesOff
    });
  };

  renderSector(index, text, start, arc, color) {
    // create canvas arc for each list element
    let canvas = document.getElementById("wheel");

    let ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let radius = this.state.radius;
    let startAngle = start;
    let endAngle = start + arc;
    let angle = index * arc;
    let baseSize = radius * 3.33;
    let textRadius = baseSize - 150;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, false);
    ctx.lineWidth = radius * 2;
    ctx.strokeStyle = color;

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.stroke();

    ctx.save();
    ctx.translate(
      baseSize + Math.cos(angle - arc / 2) * textRadius,
      baseSize + Math.sin(angle - arc / 2) * textRadius
    );
    ctx.rotate(angle - arc / 2 + Math.PI / 2);
    // ctx.textAlign = "left";
    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
    ctx.restore();
  }

  getColor() {
    // randomly generate rbg values for wheel sectors
    let opacity = Math.random();
    return `rgba(85,28,49,${opacity})`;
  }

  spin = () => {
    // set random spin degree and ease out time
    // set state variables to initiate animation

    let randomSpin = (Math.random()*800)+this.state.spinGauge + 5000;   // Added variables zo
    this.setState({
      rotate: randomSpin,
      easeOut: 2,
      spinning: true
    });

    // calcalute result after wheel stops spinning
    setTimeout(() => {
      this.getResult(randomSpin);
    }, 2000);
  };

  getResult = (spin) => {
    // find net rotation and add to offset angle
    // repeat substraction of inner angle amount from total distance traversed
    // use count as an index to find value of result from state list
    const { angle, top, offset, list } = this.state;
    let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
    let travel = netRotation + offset;
    let count = top + 1;
    while (travel > 0) {
      travel = travel - angle;
      count--;
    }
    let result;
    if (count >= 0) {
      result = count;
    } else {
      result = list.length + count;
    }

    // set state variable to display result and call api
    this.setState({
      net: netRotation,
      result: result
    },()=>{
      this.ApiService()
    });
  };

  reset = () => {
    // reset wheel and result
    this.setState({
      rotate: 0,
      easeOut: 0,
      result: null,
      spinning: false,
      spinGauge:0
    });
  };

  render() {
    return (
      <div className="App">
        <Header/>
        <div className="wheel-rotator" style={this.state.spinning?{pointerEvents:"none"}:null}>
        <span
          style={
            this.state.spinning
              ? this.state.result
                ? { transform: "rotate(0deg)" }
                : { transform: "rotate(-52deg)" }
              : null
          }
          id="selector"
        >
          &#9660;
        </span>
        {this.state.spinning ? (
          <ButtonUI spin={this.spin}>
            <span id="result">{this.state.list[this.state.result]}</span>
          </ButtonUI>
        ) : (
         <ButtonUI spin={this.spin}>Spin</ButtonUI>
        )}
        <canvas
          id="wheel"
          width="500"
          height="500"
          style={{
            WebkitTransform: `rotate(${this.state.rotate}deg)`,
            WebkitTransition: `-webkit-transform ${this.state.easeOut}s ease-out`
          }}
        />
        </div>
        
        {!this.state.result && !this.state.spinning &&
          <ProgessBar spinGauge={this.state.spinGauge}/>
        }

        {this.state.result &&
            <button
            type="button"
            id="reset"
            onClickCapture={this.reset}
            >
            Refresh
            </button>
        }

        <CardView/>
        <div className="have-question">Have a question?<span>Get help</span></div>
      </div>
    );
  }
}


export default App;
