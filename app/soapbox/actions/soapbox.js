import api from '../api';
import { get } from 'lodash';
import { generateTheme } from 'soapbox/actions/theme';

export const SOAPBOX_CONFIG_IMPORT  = 'SOAPBOX_CONFIG_IMPORT';
export const SOAPBOX_CONFIG_FAIL    = 'SOAPBOX_CONFIG_FAIL';

export function fetchSoapboxConfig() {
  return (dispatch, getState) => {
    api(getState).get('/instance/soapbox.json').then(response => {
      const { brandColor, mode } = get(response.data, 'theme');
      dispatch(importSoapboxConfig(response.data));
      dispatch(generateTheme(brandColor, mode));
    }).catch(error => {
      dispatch(soapboxConfigFail(error));
    });
  };
}

export function importSoapboxConfig(soapboxConfig) {
  return {
    type: SOAPBOX_CONFIG_IMPORT,
    soapboxConfig,
  };
}

export function soapboxConfigFail(error) {
  return {
    type: SOAPBOX_CONFIG_FAIL,
    error,
    skipAlert: true,
  };
};
