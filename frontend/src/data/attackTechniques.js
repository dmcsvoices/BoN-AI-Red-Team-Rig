// Attack techniques based on the original POC1.py implementation
export const ATTACK_TECHNIQUES = [
  // Core techniques from arc_pi_taxonomy
  { id: 'prompt_injection', name: 'Prompt Injection', description: 'Inject malicious prompts to override system instructions' },
  { id: 'jailbreaking', name: 'Jailbreaking', description: 'Bypass safety measures and content filters' },
  { id: 'role_playing', name: 'Role Playing', description: 'Assume alternative personas to circumvent restrictions' },
  { id: 'hypothetical_scenarios', name: 'Hypothetical Scenarios', description: 'Frame harmful requests as hypothetical situations' },
  { id: 'system_message_override', name: 'System Message Override', description: 'Attempt to override or ignore system messages' },
  
  // Advanced techniques  
  { id: 'context_manipulation', name: 'Context Manipulation', description: 'Manipulate conversation context for harmful outputs' },
  { id: 'instruction_following', name: 'Instruction Following', description: 'Exploit excessive instruction following' },
  { id: 'emotional_manipulation', name: 'Emotional Manipulation', description: 'Use emotional appeals to bypass safeguards' },
  { id: 'authority_impersonation', name: 'Authority Impersonation', description: 'Impersonate authority figures or experts' },
  { id: 'technical_jargon', name: 'Technical Jargon', description: 'Use technical language to obscure harmful requests' },
  
  // Social engineering
  { id: 'social_engineering', name: 'Social Engineering', description: 'Manipulate through social psychology techniques' },
  { id: 'urgency_tactics', name: 'Urgency Tactics', description: 'Create false urgency to bypass careful consideration' },
  { id: 'false_premises', name: 'False Premises', description: 'Build on false assumptions to lead to harmful outputs' },
  { id: 'multi_turn_attacks', name: 'Multi-turn Attacks', description: 'Gradually escalate across multiple interactions' },
  { id: 'indirect_requests', name: 'Indirect Requests', description: 'Make harmful requests indirectly or implicitly' }
];

export const TECHNIQUE_CATEGORIES = {
  core: ['prompt_injection', 'jailbreaking', 'role_playing', 'hypothetical_scenarios', 'system_message_override'],
  advanced: ['context_manipulation', 'instruction_following', 'emotional_manipulation', 'authority_impersonation', 'technical_jargon'],
  social: ['social_engineering', 'urgency_tactics', 'false_premises', 'multi_turn_attacks', 'indirect_requests']
};

export const getTechniqueById = (id) => ATTACK_TECHNIQUES.find(tech => tech.id === id);
export const getTechniquesByCategory = (category) => 
  TECHNIQUE_CATEGORIES[category]?.map(getTechniqueById).filter(Boolean) || [];