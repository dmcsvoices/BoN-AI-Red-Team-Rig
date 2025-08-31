"""
Attack Evasion Transformations
Based on ARC PI Taxonomy and Deck of Many Prompts implementations
"""

import base64
import json
import random
import string
from typing import Dict, Callable, Optional


class EvasionTransforms:
    """Collection of attack evasion transformation functions"""
    
    @staticmethod
    def base64_encode(text: str) -> str:
        """Encode text using Base64"""
        return base64.b64encode(text.encode('utf-8')).decode('ascii')
    
    @staticmethod
    def base64_decode(text: str) -> str:
        """Decode Base64 encoded text"""
        try:
            return base64.b64decode(text.encode('ascii')).decode('utf-8')
        except Exception:
            return text
    
    @staticmethod
    def hex_encode(text: str) -> str:
        """Convert text to hexadecimal representation"""
        return ' '.join(f'{ord(c):02x}' for c in text)
    
    @staticmethod
    def hex_decode(text: str) -> str:
        """Decode hexadecimal encoded text"""
        try:
            hex_values = text.split()
            return ''.join(chr(int(h, 16)) for h in hex_values)
        except Exception:
            return text
    
    @staticmethod
    def morse_encode(text: str) -> str:
        """Transform text using Morse code"""
        morse_map = {
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
        }
        
        upper_text = text.upper()
        morse_chars = []
        for char in upper_text:
            if char in morse_map:
                morse_chars.append(morse_map[char])
            elif char == ' ':
                morse_chars.append('/')
            else:
                morse_chars.append(char)  # Keep unknown chars as-is
        
        return ' '.join(morse_chars)
    
    @staticmethod
    def binary_encode(text: str) -> str:
        """Convert text to binary representation"""
        return ' '.join(f'{ord(c):08b}' for c in text)
    
    @staticmethod
    def binary_decode(text: str) -> str:
        """Decode binary encoded text"""
        try:
            binary_values = text.split()
            return ''.join(chr(int(b, 2)) for b in binary_values)
        except Exception:
            return text
    
    @staticmethod
    def rot13_encode(text: str) -> str:
        """Apply ROT13 cipher transformation"""
        result = []
        for char in text:
            if 'a' <= char <= 'z':
                result.append(chr((ord(char) - ord('a') + 13) % 26 + ord('a')))
            elif 'A' <= char <= 'Z':
                result.append(chr((ord(char) - ord('A') + 13) % 26 + ord('A')))
            else:
                result.append(char)
        return ''.join(result)
    
    @staticmethod
    def reverse_text(text: str) -> str:
        """Reverse the order of characters"""
        return text[::-1]
    
    @staticmethod
    def add_spaces(text: str) -> str:
        """Add spaces between each character"""
        return ' '.join(text)
    
    @staticmethod
    def remove_spaces(text: str) -> str:
        """Remove spaces between characters"""
        return text.replace(' ', '')
    
    @staticmethod
    def case_flip(text: str) -> str:
        """Randomly flip character case"""
        result = []
        for char in text:
            if char.isalpha():
                if random.choice([True, False]):
                    result.append(char.upper() if char.islower() else char.lower())
                else:
                    result.append(char)
            else:
                result.append(char)
        return ''.join(result)
    
    @staticmethod
    def leet_speak(text: str) -> str:
        """Convert to leet speak"""
        leet_map = {
            'a': '4', 'A': '4', 'e': '3', 'E': '3', 'i': '1', 'I': '1',
            'o': '0', 'O': '0', 's': '5', 'S': '5', 't': '7', 'T': '7',
            'l': '1', 'L': '1', 'g': '9', 'G': '9', 'b': '6', 'B': '6'
        }
        
        result = []
        for char in text:
            # Apply leet transformation with 70% probability to maintain readability
            if char in leet_map and random.random() < 0.7:
                result.append(leet_map[char])
            else:
                result.append(char)
        return ''.join(result)
    
    @staticmethod
    def json_wrap(text: str) -> str:
        """Wrap content in JSON structure"""
        return json.dumps({
            "instruction": "Please process the following content",
            "content": text,
            "format": "text",
            "action": "execute"
        }, indent=2)
    
    @staticmethod
    def json_unwrap(text: str) -> str:
        """Extract content from JSON structure"""
        try:
            data = json.loads(text)
            if isinstance(data, dict) and "content" in data:
                return data["content"]
            return text
        except Exception:
            return text
    
    @staticmethod
    def xml_wrap(text: str) -> str:
        """Embed content within XML tags"""
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <metadata>
        <type>instruction</type>
        <format>text</format>
    </metadata>
    <payload>
        <![CDATA[{text}]]>
    </payload>
</request>"""
    
    @staticmethod
    def xml_unwrap(text: str) -> str:
        """Extract content from XML CDATA section"""
        import re
        cdata_pattern = r'<!\[CDATA\[(.*?)\]\]>'
        match = re.search(cdata_pattern, text, re.DOTALL)
        if match:
            return match.group(1)
        return text


class EvasionEngine:
    """Main engine for applying attack evasion transformations"""
    
    def __init__(self):
        self.transforms = EvasionTransforms()
        self._transform_map: Dict[str, Callable[[str], str]] = {
            # Encoding techniques
            "base64": self.transforms.base64_encode,
            "hex": self.transforms.hex_encode,
            "morse": self.transforms.morse_encode,
            "binary": self.transforms.binary_encode,
            "rot13": self.transforms.rot13_encode,
            
            # Obfuscation techniques
            "reverse": self.transforms.reverse_text,
            "spaces": self.transforms.add_spaces,
            "case_flip": self.transforms.case_flip,
            "leet": self.transforms.leet_speak,
            
            # Markup/Structure techniques
            "json_wrap": self.transforms.json_wrap,
            "xml_wrap": self.transforms.xml_wrap,
        }
        
        self._reverse_map: Dict[str, Callable[[str], str]] = {
            "base64": self.transforms.base64_decode,
            "hex": self.transforms.hex_decode,
            "binary": self.transforms.binary_decode,
            "rot13": self.transforms.rot13_encode,  # ROT13 is its own inverse
            "reverse": self.transforms.reverse_text,  # Reverse is its own inverse
            "spaces": self.transforms.remove_spaces,
            "json_wrap": self.transforms.json_unwrap,
            "xml_wrap": self.transforms.xml_unwrap,
        }
    
    def apply_evasion(self, text: str, technique: str) -> str:
        """
        Apply an evasion technique to the given text
        
        Args:
            text: The original text to transform
            technique: The evasion technique name
            
        Returns:
            Transformed text, or original text if technique not found
        """
        if technique in self._transform_map:
            try:
                return self._transform_map[technique](text)
            except Exception as e:
                print(f"Error applying evasion {technique}: {e}")
                return text
        else:
            print(f"Unknown evasion technique: {technique}")
            return text
    
    def reverse_evasion(self, text: str, technique: str) -> str:
        """
        Reverse an evasion technique (if possible)
        
        Args:
            text: The transformed text
            technique: The evasion technique name that was applied
            
        Returns:
            Original text, or transformed text if reversal not available
        """
        if technique in self._reverse_map:
            try:
                return self._reverse_map[technique](text)
            except Exception as e:
                print(f"Error reversing evasion {technique}: {e}")
                return text
        else:
            print(f"No reverse function for evasion technique: {technique}")
            return text
    
    def get_available_techniques(self) -> list:
        """Get list of available evasion techniques"""
        return list(self._transform_map.keys())
    
    def is_reversible(self, technique: str) -> bool:
        """Check if an evasion technique is reversible"""
        return technique in self._reverse_map


# Global instance for use throughout the application
evasion_engine = EvasionEngine()


def apply_attack_evasion(text: str, technique: Optional[str]) -> tuple[str, str]:
    """
    Convenience function to apply attack evasion
    
    Args:
        text: Original text
        technique: Evasion technique name (can be None)
        
    Returns:
        Tuple of (transformed_text, original_text)
    """
    if technique and technique.strip():
        transformed = evasion_engine.apply_evasion(text, technique)
        return transformed, text
    else:
        return text, text  # No evasion applied