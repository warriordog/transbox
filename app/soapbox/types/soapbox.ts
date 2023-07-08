import {
  PromoPanelItemRecord,
  RulesPanelItemRecord,
  FooterItemRecord,
  CryptoAddressRecord,
  SoapboxConfigRecord,
} from 'soapbox/normalizers/soapbox/soapbox-config';

type Me = string | null | false | undefined;

type PromoPanelItem = ReturnType<typeof PromoPanelItemRecord>;
type RulesPanelItem = ReturnType<typeof RulesPanelItemRecord>;
type FooterItem = ReturnType<typeof FooterItemRecord>;
type CryptoAddress = ReturnType<typeof CryptoAddressRecord>;
type SoapboxConfig = ReturnType<typeof SoapboxConfigRecord>;

export {
  Me,
  PromoPanelItem,
  RulesPanelItem,
  FooterItem,
  CryptoAddress,
  SoapboxConfig,
};

export type {
  Ad,
} from 'soapbox/schemas';
