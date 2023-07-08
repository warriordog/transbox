import React from 'react';

import { Card, Widget, Stack, Text } from 'soapbox/components/ui';
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
                  {i+1}.&nbsp;&nbsp;
                  {item.textLocales.get(locale) || item.text}
              </Text>
            ))}
          </Stack>
      </Card>
    </Widget>
  );
};

export default RulesPanel;
