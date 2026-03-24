// ============================================================
// GradientButton – a stylish pressable button
// ============================================================
import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import {COLORS} from '../constants';

interface Props {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'outline' | 'danger';
}

const GradientButton: React.FC<Props> = ({
  label,
  onPress,
  isLoading,
  disabled,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const containerStyle =
    variant === 'outline'
      ? styles.outline
      : variant === 'danger'
      ? styles.danger
      : styles.primary;

  const labelStyle =
    variant === 'outline' ? styles.outlineText : styles.primaryText;

  return (
    <Animated.View style={[{transform: [{scale}]}, style]}>
      <TouchableOpacity
        style={[
          styles.base,
          containerStyle,
          (disabled || isLoading) && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.8}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={[labelStyle, textStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  outlineText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default GradientButton;
