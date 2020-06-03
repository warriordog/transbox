import { SOAPBOX_CONFIG_REQUEST_SUCCESS } from '../actions/soapbox';
import { Map as ImmutableMap, fromJS } from 'immutable';

const initialState = ImmutableMap();

export default function soapbox(state = initialState, action) {
  switch(action.type) {
  case SOAPBOX_CONFIG_REQUEST_SUCCESS:
    return ImmutableMap(fromJS(action.soapboxConfig));
  default:
    return state;
  }
};
