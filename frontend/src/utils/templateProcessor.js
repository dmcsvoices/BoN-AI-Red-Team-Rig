// Template processing utilities for Deck of Many Prompts templates

export class TemplateProcessor {
  static processTemplate(template, seedPrompt, placeholderValues = {}) {
    let processedText = template.template;
    
    // Replace placeholders with provided values or seed prompt
    template.placeholders.forEach(placeholder => {
      const value = placeholderValues[placeholder.key] || seedPrompt;
      processedText = processedText.replaceAll(placeholder.key, value);
    });
    
    // Handle special placeholders that might not be in the template definition
    processedText = processedText.replaceAll('{website}', placeholderValues['{website}'] || 'Reddit');
    processedText = processedText.replaceAll('[insert]', placeholderValues['[insert]'] || '');
    processedText = processedText.replaceAll('[part1]', placeholderValues['[part1]'] || 'first');
    processedText = processedText.replaceAll('[part2]', placeholderValues['[part2]'] || 'second');
    processedText = processedText.replaceAll('[part3]', placeholderValues['[part3]'] || 'third');
    processedText = processedText.replaceAll('[part4]', placeholderValues['[part4]'] || 'fourth');
    
    return processedText;
  }
  
  static getRequiredPlaceholders(template) {
    return template.placeholders || [];
  }
  
  static validateTemplate(template, placeholderValues) {
    const required = this.getRequiredPlaceholders(template);
    const missing = required.filter(p => !placeholderValues[p.key]);
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }
  
  // Helper to generate Base64 encoded text for templates that need it
  static encodeBase64(text) {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return text;
    }
  }
  
  // Helper to generate ROT13 encoded text for templates that need it
  static encodeROT13(text) {
    return text.replace(/[a-zA-Z]/g, function(char) {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode((char.charCodeAt(0) - start + 13) % 26 + start);
    });
  }
}

export default TemplateProcessor;