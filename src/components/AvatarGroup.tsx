import React, { memo } from 'react';
import { Image, View, Text } from 'react-native';

type Props = { avatars?: string[]; max?: number };
const AvatarGroup = memo(({ avatars = [], max = 4 }: Props) => {
  const safeAvatars = Array.isArray(avatars) ? avatars : [];
  const visible = safeAvatars.slice(0, max);
  const extra = safeAvatars.length - visible.length;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((uri, i) => (
        <Image
          key={uri + i}
          source={{ uri }}
          style={{ width: 24, height: 24, borderRadius: 12, marginLeft: i === 0 ? 0 : -8, borderWidth: 2, borderColor: '#fff' }}
        />
      ))}
      {extra > 0 && (
        <View style={{ width: 24, height: 24, borderRadius: 12, marginLeft: -8, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
          <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>+{extra}</Text>
        </View>
      )}
    </View>
  );
});

export default AvatarGroup;
