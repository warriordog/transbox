import React from 'react';

import { HStack, Input } from 'soapbox/components/ui';

import type { StreamfieldComponent } from 'soapbox/components/ui/streamfield/streamfield';
import type { RulesPanelItem } from 'soapbox/types/soapbox';

const RulesPanelInput: StreamfieldComponent<RulesPanelItem> = ({ value, onChange }) => {

  const handleChange = (key: 'text'): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      onChange(value.set(key, e.currentTarget.value));
    };
  };

  return (
    <HStack space={2} alignItems='center' grow>
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder='Rule'
        value={value.text}
        onChange={handleChange('text')}
      />
    </HStack>
  );
};

export default RulesPanelInput;
