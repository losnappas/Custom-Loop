import React from 'react';
import ReactDOM from 'react-dom';
import Slider, {Range} from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Alert from 'react-s-alert';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/jelly.css';


//TO-DO: add manual text input for time ranges.

//range tooltip wouldn't show if const Range = createSliderWithTooltip(Slider.Range); and <Tooltip prefixCls="rc-slider-tooltip" (as example was) + react-modal-dialog
//put in an issue report.
// https://react-component.github.io/slider/examples/handle.html
const createSliderWithTooltip = Slider.createSliderWithTooltip;
// const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;


const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-tooltip" //diff from example
      overlay={fancyTimeFormat(value)}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps}  />
    </Tooltip>
  );
};


//duplicate code from background.js o_O
const fancyTimeFormat = function(time)
{   
    // Hours, minutes and seconds
    // ~~ === Math.floor
    time = ~~time;
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}


const buttonStyle = {width: 80, height: 17, cursor: 'pointer', border: '1px solid black', background: 'lightGreen', color: 'black', fontSize: '10px', float: 'left', paddingLeft: '2px'};
const saveButtonStyle = {width: 50, height: 17, cursor: 'pointer', border: '1px solid black', background: 'lightGreen', color: 'black', fontSize: '10px', float: 'right'};
const cancelButtonStyle = {width: 50, height: 17, cursor: 'pointer', border: '1px solid black', background: 'lightGray', color: 'black', fontSize: '10px', float: 'right'};

class AdvancedMenuContent extends React.Component{

	constructor(props) {
		super(props);
		this.state = {
			value: this.props.defaults,
			trackColors: [{backgroundColor: 'green'}],
		};
	}


	//lifecycles OP!!
	componentWillMount(){
		this.colorTrack();
	}

  	handleClose = () => Alert.closeAll();

  	handleAddNewToggles = (e) => {
  		let togglesAdded = this.state.value;
  		togglesAdded.push(0, 0);
  		this.handleChange(togglesAdded);
  		this.colorTrack();
  	}

  	handleChange = (newValue) => this.setState({value: newValue});

  	saveChanges = () => {
  		this.props.loopTimer(this.state.value);
  		this.handleClose();
  	}

	colorTrack = () => {
		let greenTrack = {backgroundColor: 'green'};
  		let redTrack = {backgroundColor: 'red'};
  		let finishedTrack = [];
  		for (var i = 0; i < this.state.value.length; i++) {
  			finishedTrack.push(greenTrack, redTrack);
  		}
  		this.setState({trackColors: finishedTrack});
	}  	

// bugged*
	// reset = () => {
	// 	this.setState({
	// 		value: [0,0],
	// 		trackColors: [{backgroundColor: 'green'}],
	// 	});
	// }
// currently bugged* ->
/*						<button
							onClick={this.reset}
							style={saveButtonStyle}
							>Reset</button>
*/


	//*bug? - if value={this.state.value} in Range, then handleAddNewToggles glitches out.
	//and with value absent, the Range can't be reset.
	// or mb it can considering addToggles works? next version milestone.
	render() {
		return (<div>
					<h2 style={{fontSize: '16px', fontWeight: 'normal', background: 'transparent', textAlign: 'start', margin: 0, border: 0, padding: 0}}>Custom Loop</h2>
					<p style={{fontSize: '12px'}}>0 second intervals will be skipped.</p>
						<Range
							min={0}
							max={this.props.max}
							defaultValue={this.props.defaults ? this.props.defaults : [0,0]}
							onChange={this.handleChange}
							handle={handle}
							trackStyle={this.state.trackColors}
							></Range>

						<div style={{marginTop: '5px'}}>
							<button
								onClick={this.handleAddNewToggles}
								style={buttonStyle}
								title="Adds toggles to seconds 0 and 0"
								>New segment</button>

							<button
								onClick={this.saveChanges}
								style={saveButtonStyle}
								title="Save changes and close"
								>Save</button>
							<button
								onClick={this.handleClose}
								style={cancelButtonStyle}
								>Cancel</button>
						</div>
				</div>
			);
	}
}

export default class AdvancedMenu extends React.Component{
	constructor(props){
		super(props);
	}

	// listener for context menu item
	componentDidMount(){
		if (!browser.runtime.onMessage.hasListener(this.handleOpen))
				browser.runtime.onMessage.addListener(this.handleOpen);
	}


	handleOpen = (request) => {
		if (request.command=='looperadvanced') {

			//https://www.npmjs.com/package/react-s-alert
			Alert.warning(<AdvancedMenuContent  {...this.props} />, {
	            position: 'bottom',
	            effect: 'jelly',
	            timeout: 'none'
        	});
		}
	}

	render(){
		return (<Alert stack={false} style={{padding: '19.5px'}} />);
	}
}


