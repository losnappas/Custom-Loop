import React from 'react'
import ReactDOM from 'react-dom'
//https://www.npmjs.com/package/rc-slider
import Slider, {Range} from 'rc-slider'
import Tooltip from 'rc-tooltip'
//https://www.npmjs.com/package/react-s-alert
import Alert from 'react-s-alert'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/jelly.css'
import './styles.css'
import fancyTimeFormat from './fancyTimeFormat'


// https://react-component.github.io/slider/examples/handle.html
const createSliderWithTooltip = Slider.createSliderWithTooltip
// const Range = createSliderWithTooltip(Slider.Range)
const Handle = Slider.Handle


const handle = (props) => {
  const { value, dragging, index, ...restProps } = props
  return (
    <Tooltip
      prefixCls="rc-tooltip" //diff from example
      overlay={fancyTimeFormat(value)}
      // visible={dragging} // <-- don't want you!!!!
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps}  />
    </Tooltip>
  )
}

export class AdvancedMenu extends React.Component{

  constructor(props) {
    super(props)

    // clown fiesta
    this.state = {
      value: this.props.defaults,
      trackColors: [{backgroundColor: 'green'}],
      currentTime: fancyTimeFormat( this.props.getCurrentTime () ),
      allGood: (this.props.defaults.length % 2 === 0),
    }
  }


  //lifecycles OP!!
  componentWillMount(){
    this.colorTrack()
  }


  componentDidMount() {
    this.timer = setInterval( () => {
      this.setState({
        currentTime: fancyTimeFormat( this.props.getCurrentTime () )
      })      
    }, 1000 )
  }

  componentWillUnmount() {
    clearInterval( this.timer )
  }


  handleClose = () => {
    Alert.closeAll()
  }

  handleAddNewToggle = () => {
    let time = this.props.getCurrentTime()
    
    let addingToggle = this.state.value.slice()

    for ( let i = 0 ; i < addingToggle.length ; i++ ) {
      if ( time < addingToggle[ i ] ) {
        addingToggle.splice( i, 0, time )
        break
      }
	  if ( i === ( addingToggle.length -1 ) ) {
	    addingToggle.push( time )
	    break
	  }
    }
    this.handleChange( addingToggle )
    this.colorTrack()
  }


  handleChange = newValue => {
    this.setState({
      value: newValue,
      allGood: newValue.length % 2 === 0
    })
  }

  //milestone for version 5000
  //somehow transform into promises for no good reason other than getting rid of the global variable
  saveChanges = () => {
    this.props.loopTimer(this.state.value)
    this.handleClose()
  }

  //milestone 3: move slider to functional component and clean up the render function
  colorTrack = () => {
    let greenTrack = { backgroundColor: 'green' }
    let redTrack = { backgroundColor: 'red' }
    let finishedTrack = []
    for (var i = 0; i < this.state.value.length; i++) {
      finishedTrack.push(greenTrack, redTrack)
    }
    this.setState({trackColors: finishedTrack})
  }   

  handleManualChange = event => {
    //throws an error after typing a comma, but catching it is not a good idea since nothing can be done about it
    //milestone 100: parse the input better, giving an error if saving while the array is no good
    this.handleChange(JSON.parse( "["+event.target.value+"]"))
    this.colorTrack()
  }

  flooring = () => {
    let x = this.state.value.slice()
    x = x.map( i => ~~i )
    return x
  }

  render() {
    return (
      <div className="customloop">
        <div className="content">
        <h3>Custom Loop</h3>

          <span className="moveright">
            <input type="text" onChange={this.handleManualChange} value={this.flooring()} />
            { this.state.allGood && 
              <img src={browser.extension.getURL("img/check.png")} alt="Ok" width="15" height="15" /> }
          </span>

        </div>

		
		<div className="slider-container">

		   <Range
				  min={0}
				  max={this.props.max}
				  onChange={this.handleChange}
				  handle={handle}
				  trackStyle={this.state.trackColors}
				  value={this.state.value}
				  ></Range>
		</div>

        <div className="button-container">
          <button
            onClick={this.handleAddNewToggle}
            title="Add a toggle at current time"
            >{ this.state.currentTime }</button>

          <button
            className="functional save"
            onClick={this.saveChanges}
            title="Save changes and close"
            >Save</button>

          <button
            className="functional cancel"
            onClick={this.handleClose}
            >Cancel</button>

        </div>
      </div>
    )
  }
}


export default class AdvancedMenuWrapper extends React.Component {
  render() {
    return (
      <Alert stack={false} />
    )
  }
}

