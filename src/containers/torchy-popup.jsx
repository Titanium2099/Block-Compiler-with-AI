import React from 'react';
import TorchyPopupComponent from '../components/torchy-popup/torchy-popup.jsx';
import DragConstants from '../lib/drag-constants'; 
import DropAreaHOC from '../lib/drop-area-hoc.jsx';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const dragTypes = [DragConstants.CODE];
const droppablePopup = DropAreaHOC(dragTypes)(TorchyPopupComponent);
class TorchyPopup extends React.Component {
    handleDrop = (dragInfo) => {
        console.log('Parent handleDrop:', dragInfo);
        // Handle the drop logic here if necessary
    }
    handleDragStart = (dragInfo) => {
        console.log('Parent handleDragStart:', dragInfo);
        // Handle the drag start logic here if necessary
    }
    handleDragEnd = (dragInfo) => {
        console.log('Parent handleDragEnd:', dragInfo);
        // Handle the drag end logic here if necessary
    }
    

    render() {
        const { fileAttached, fileAttachedText, inputValue, X_COORDINATE, Y_COORDINATE } = this.props;
        const Droppable = droppablePopup;
        return (
            <Droppable
                fileAttached={fileAttached}
                fileAttachedText={fileAttachedText}
                inputValue={inputValue}
                X_COORDINATE={X_COORDINATE}
                Y_COORDINATE={Y_COORDINATE}
                handleDrop={this.handleDrop}
            />
        );
    }
}

TorchyPopup.propTypes = {
    fileAttached: PropTypes.bool,
    fileAttachedText: PropTypes.string,
    inputValue: PropTypes.string,
    X_COORDINATE: PropTypes.number,
    Y_COORDINATE: PropTypes.number
};

const mapStateToProps = state => Object.assign(
  {
      dragInfo: state.scratchGui.assetDrag,
      vm: state.scratchGui.vm,
      blockDrag: state.scratchGui.blockDrag
  }
);

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TorchyPopup);
