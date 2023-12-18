
# react-native-selectable-text

This is the updated version of @alentoma/react-native-selectable-text.

It fixes a lof of issues that kept it from running on iOS machines. It works with projects that have shareExtensions, works on M1 machines, and I removed old dependencies that were no longer supported.

## Original Astrocoders Demo

### Android

<img src="https://github.com/Astrocoders/react-native-selectable-text/raw/master/Demo/demo_android.gif" width="350px" />

### iOS

<img src="https://user-images.githubusercontent.com/16995184/54835973-055e7480-4ca2-11e9-8d55-c4f7a67c2847.gif" width="350px" />

## Usage

This differs a lot from the way the original project was written. Basically, ignore the value prop and pass text components as children using the `textComponentProps` section.

Typescript will give you an error saying that you need value to be defined. You do not. PR's to fix this welcome.

The reason we do this is because by using `textComponentsProps`, we can use nested text styles and everything just works. Example:

```javascript
import { SelectableText } from "@rob117/react-native-selectable-text";

const child = (
    <Text style={ {color: 'orange'} } { ...props }>
      This will be orange and selectable
      <Text style={ { color: 'green' } }>
        , and this is green and selectable
      </Text>
      , and this is orange and will continue to be selectable with no breaks.
    </Text>
  );

<SelectableText
  menuItems={["Delete", "Randomize"]}
  // Use the child we defined above
  textComponentProps={ { children: child } }
  /* 
    Called when the user taps in a item of the selection menu:
    - eventType: (string) is the label in menu items
    - content: (string) the selected text portion
    - selectionStart: (int) is the start position of the selected text
    - selectionEnd: (int) is the end position of the selected text
   */
  onSelection={({ eventType, content, selectionStart, selectionEnd }) => {}}
/>
```

## Important caveat

the `textComponentProps` child property must consist exclusively of `Text` (or similar, like react-native-paper `Text`) fields. If it has, say, a `View` wrapping the text, everything fails.

## Getting started

`$ yarn add @rob117/react-native-selectable-text`

## This project does not auto-link for iOS, you MUST do the following

I don't know how to get auto-linking working, so do this instead:

1. Add `pod 'react-native-selectable-text', :path => '../node_modules/@rob117/react-native-selectable-text'` to your projects podfile
2. run `pod install`

#### Android

Do nothing. Should actually just work.

## Props
| name | description | type | default |
|--|--|--|--|
| **value** | text content | string | "" |
| **onSelection** | Called when the user taps in a item of the selection menu | ({ eventType: string, content: string, selectionStart: int, selectionEnd: int }) => void | () => {} |
| **menuItems** | context menu items | array(string) | [] |
| **style** | additional styles to be applied to text | Object | null |
| **highlights** | array of text ranges that should be highlighted with an optional id | array({ id: string, start: int, end: int }) | [] |
| **highlightColor** | highlight color |string | null |
| **onHighlightPress** | called when the user taps the highlight  |(id: string) => void | () => {} |
| **appendToChildren** | element to be added in the last line of text | ReactNode | null |
| **TextComponent** | Text component used to render `value` | ReactNode | <Text> |
| **textValueProp** | text value prop for TextComponent. Should be used when passing TextComponent. Defaults to 'children' which works for <Text> | string | 'children' |
| **textComponentProps** | additional props to pass to TextComponent | object | null |
