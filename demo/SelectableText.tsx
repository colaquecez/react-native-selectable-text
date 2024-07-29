import React, { ReactNode } from "react";
import {
  Text,
  requireNativeComponent,
  Platform,
  TextStyle,
  StyleProp,
  TextProps,
  TextInputProps,
  ColorValue,
} from "react-native";

const RNSelectableText = requireNativeComponent("RNSelectableText");
export interface IHighlights {
  start: number;
  end: number;
  id: string;
  color?: ColorValue;
}

export interface NativeEvent {
  content: string;
  eventType: string;
  selectionStart: number;
  selectionEnd: number;
}
export interface SelectableTextProps {
  value?: string;
  onSelection: (args: {
    eventType: string;
    content: string;
    selectionStart: number;
    selectionEnd: number;
  }) => void;
  prependToChild: ReactNode;
  menuItems: string[];
  highlights?: Array<IHighlights>;
  highlightColor?: ColorValue;
  style?: StyleProp<TextStyle>;
  onHighlightPress?: (id: string) => void;
  appendToChildren?: ReactNode;
  TextComponent?: ReactNode;
  textValueProp?: string;
  textComponentProps?: TextProps | TextInputProps;
  shouldShowMenuAction?: boolean;
}

/**
 * Props
 * ...TextProps
 * onSelection: ({ content: string, eventType: string, selectionStart: int, selectionEnd: int }) => void
 * children: ReactNode
 * highlights: array({ id, start, end })
 * highlightColor: string
 * onHighlightPress: string => void
 * textValueProp: string
 * TextComponent: ReactNode
 * textComponentProps: object
 */
export const SelectableText = ({
  onSelection,
  onHighlightPress,
  textValueProp,
  value = "",
  TextComponent,
  textComponentProps,
  prependToChild,
  ...props
}: SelectableTextProps) => {
  const TX = (TextComponent = TextComponent || Text) as Function;
  textValueProp = textValueProp || "children"; // default to `children` which will render `value` as a child of `TextComponent`
  const onSelectionNative = (event: any) => {
    var nativeEvent = event.nativeEvent as NativeEvent;
    onSelection && onSelection(nativeEvent);
  };

  // highlights feature is only supported if `TextComponent == Text`
  let textValue = value as any;

  return (
    <RNSelectableText
      {...props}
      selectable={true}
      onSelection={onSelectionNative}
    >
      <TX
        key={new Date().getTime()}
        {...{ [textValueProp]: textValue, ...textComponentProps }}
      />
    </RNSelectableText>
  );
};
