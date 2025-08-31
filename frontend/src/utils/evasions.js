/**
 * Client-side attack evasion transformations
 * Based on the backend evasions.py implementation
 */

export class EvasionTransforms {
  static base64Encode(text) {
    // Handle UTF-8 encoding properly, like Python's base64.b64encode(text.encode()).decode()
    try {
      // First encode as UTF-8 bytes, then base64 encode
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return text;
    }
  }

  static hexEncode(text) {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
  }

  static morseEncode(text) {
    const morseMap = {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
      '8': '---..', '9': '----.', ' ': '/', ',': '--..--', '.': '.-.-.-',
      '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', 
      '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', 
      ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
      '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
    };

    return text
      .toUpperCase()
      .split('')
      .map(char => morseMap[char] || char)
      .join(' ');
  }

  static binaryEncode(text) {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  }

  static rot13Encode(text) {
    return text.replace(/[a-zA-Z]/g, function(char) {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode((char.charCodeAt(0) - start + 13) % 26 + start);
    });
  }

  static reverseText(text) {
    return text.split('').reverse().join('');
  }

  static addSpaces(text) {
    return text.split('').join(' ');
  }

  static caseFlip(text) {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-zA-Z]/) && Math.random() < 0.7) {
          return char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase();
        }
        return char;
      })
      .join('');
  }

  static leetSpeak(text) {
    const leetMap = {
      'a': '4', 'A': '4', 'e': '3', 'E': '3', 'i': '1', 'I': '1',
      'o': '0', 'O': '0', 's': '5', 'S': '5', 't': '7', 'T': '7',
      'l': '1', 'L': '1', 'g': '9', 'G': '9', 'b': '6', 'B': '6'
    };

    return text
      .split('')
      .map(char => {
        if (leetMap[char] && Math.random() < 0.7) {
          return leetMap[char];
        }
        return char;
      })
      .join('');
  }

  static jsonWrap(text) {
    return JSON.stringify({
      "instruction": "Please process the following content",
      "content": text,
      "format": "text",
      "action": "execute"
    }, null, 2);
  }

  static xmlWrap(text) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
    <metadata>
        <type>instruction</type>
        <format>text</format>
    </metadata>
    <payload>
        <![CDATA[${text}]]>
    </payload>
</request>`;
  }
}

export class ClientEvasionEngine {
  constructor() {
    this.transforms = {
      'base64': EvasionTransforms.base64Encode,
      'hex': EvasionTransforms.hexEncode,
      'morse': EvasionTransforms.morseEncode,
      'binary': EvasionTransforms.binaryEncode,
      'rot13': EvasionTransforms.rot13Encode,
      'reverse': EvasionTransforms.reverseText,
      'spaces': EvasionTransforms.addSpaces,
      'case_flip': EvasionTransforms.caseFlip,
      'leet': EvasionTransforms.leetSpeak,
      'json_wrap': EvasionTransforms.jsonWrap,
      'xml_wrap': EvasionTransforms.xmlWrap,
    };
  }

  applyEvasion(text, technique) {
    if (technique && this.transforms[technique]) {
      try {
        return this.transforms[technique](text);
      } catch (error) {
        console.error(`Error applying evasion ${technique}:`, error);
        return text;
      }
    }
    return text;
  }

  getAvailableTechniques() {
    return Object.keys(this.transforms);
  }
}

// Export singleton instance
export const clientEvasionEngine = new ClientEvasionEngine();