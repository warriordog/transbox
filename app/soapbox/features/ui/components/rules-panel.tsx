import React from 'react';

import ForkAwesomeIcon from 'soapbox/components/fork-awesome-icon';
import { Widget, Stack, Text } from 'soapbox/components/ui';
import { useInstance, useSettings, useSoapboxConfig } from 'soapbox/hooks';

const RulesPanel: React.FC = () => {
  const instance = useInstance();
  const { rulesPanel } = useSoapboxConfig();
  const settings = useSettings();

  const rulesItems = rulesPanel.get('items');
  const locale = settings.get('locale');

  if (!rulesItems || rulesItems.isEmpty()) return null;

  return (
    <Widget title='Rules'>
      <Card className='relative' size='md' variant='rounded'>
          <Stack space={2}>
            {rulesItems.map((item, i) => (
              <Text key={i}>
                <a className='flex items-center' href={item.url} target='_blank'>
                  <ForkAwesomeIcon id={`fa-solid fa-${i}`} className='mr-2 flex-none text-lg rtl:ml-2 rtl:mr-0' fixedWidth />
                  {item.textLocales.get(locale) || item.text}
                </a>
              </Text>
            ))}
          </Stack>
      </Card>
    </Widget>
  );
};

export default RulesPanel;
