import { diffLines } from 'diff';

interface TextDiff {
  oldText: string;
  newText: string;
  type: 'added' | 'removed' | 'unchanged' | 'modified';
}

/**
 * Identifies changed sections between two contract texts using line-based diff
 * @param oldText Original contract text
 * @param newText New contract text
 * @returns Array of changed sections with their old and new versions
 */
export function identifyChangedSections(oldText: string, newText: string): TextDiff[] {
  console.log('📊 Running text-diff pre-processing...');
  
  // Get line-by-line differences
  const differences = diffLines(oldText, newText);
  
  // Process the differences into meaningful sections
  const changedSections: TextDiff[] = [];
  let currentOldText = '';
  let currentNewText = '';
  let hasChanges = false;
  
  // Process each diff chunk
  differences.forEach(part => {
    // If this is a large unchanged section, and we have accumulated changes,
    // push the current changes and reset
    if (!part.added && !part.removed && part.value.split('\n').length > 5 && hasChanges) {
      if (currentOldText || currentNewText) {
        changedSections.push({
          oldText: currentOldText,
          newText: currentNewText,
          type: currentOldText && currentNewText ? 'modified' : currentOldText ? 'removed' : 'added'
        });
      }
      currentOldText = '';
      currentNewText = '';
      hasChanges = false;
    }
    
    // Add content to the appropriate text accumulator
    if (part.added) {
      currentNewText += part.value;
      hasChanges = true;
    } else if (part.removed) {
      currentOldText += part.value;
      hasChanges = true;
    } else {
      // For unchanged parts, add a bit of context to both versions
      // But limit context to avoid too much text
      const lines = part.value.split('\n');
      const contextLines = 2; // Number of context lines to include
      
      if (lines.length <= contextLines * 2) {
        // If the unchanged part is small, include it all
        currentOldText += part.value;
        currentNewText += part.value;
      } else {
        // Otherwise, include just some context lines
        const prefixContext = lines.slice(0, contextLines).join('\n');
        const suffixContext = lines.slice(-contextLines).join('\n');
        
        currentOldText += prefixContext + '\n...\n' + suffixContext;
        currentNewText += prefixContext + '\n...\n' + suffixContext;
      }
    }
  });
  
  // Add any remaining changes
  if (hasChanges && (currentOldText || currentNewText)) {
    changedSections.push({
      oldText: currentOldText,
      newText: currentNewText,
      type: currentOldText && currentNewText ? 'modified' : currentOldText ? 'removed' : 'added'
    });
  }
  
  console.log(`✅ Text-diff identified ${changedSections.length} changed sections`);
  return changedSections;
}

/**
 * Checks if a change is only formatting/whitespace and not substantive
 */
export function isFormattingChangeOnly(oldText: string, newText: string): boolean {
  // Normalize whitespace and compare
  const normalizedOld = oldText.replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedNew = newText.replace(/\s+/g, ' ').trim().toLowerCase();
  
  return normalizedOld === normalizedNew;
}

/**
 * Classifies the complexity and impact of a changed section
 * @param section The changed section to classify
 * @returns Classification with complexity and impact ratings
 */
export async function classifyChangeComplexity(
  section: TextDiff, 
  openai: any
): Promise<{ complexity: 'low' | 'medium' | 'high', impact: 'minimal' | 'moderate' | 'significant' }> {
  try {
    // For very small changes, classify as low complexity without using AI
    if ((section.oldText.length + section.newText.length) < 100) {
      return { complexity: 'low', impact: 'minimal' };
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a contract analysis assistant that classifies changes between contract versions." 
        },
        { 
          role: "user", 
          content: `Classify the complexity and impact of this contract change:
          
OLD VERSION:
${section.oldText}

NEW VERSION:
${section.newText}

Respond with a JSON object containing:
- complexity: "low", "medium", or "high"
- impact: "minimal", "moderate", or "significant"

Only respond with the JSON object, no other text.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return {
      complexity: result.complexity || 'low',
      impact: result.impact || 'minimal'
    };
  } catch (error) {
    console.error('Error classifying change complexity:', error);
    // Default to medium complexity if classification fails
    return { complexity: 'medium', impact: 'moderate' };
  }
} 