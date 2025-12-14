/**
 * Few-Shot Examples for Knowledge Graph Generation
 * 
 * These examples demonstrate high-quality knowledge graph construction across different domains.
 * They serve as training examples for the AI to understand the expected output format and quality.
 */

export interface FewShotExample {
  domain: string;
  input: string;
  output: {
    elements: {
      nodes: Array<{
        data: {
          id: string;
          label: string;
          type: string;
        };
      }>;
      edges: Array<{
        data: {
          source: string;
          target: string;
          label: string;
          explanation: string;
        };
      }>;
    };
  };
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  // ============================================================================
  // Science Domain
  // ============================================================================
  {
    domain: "Science",
    input: "Photosynthesis is the process by which plants convert sunlight into energy using chlorophyll.",
    output: {
      elements: {
        nodes: [
          { data: { id: "photosynthesis", label: "Photosynthesis", type: "Process" } },
          { data: { id: "plants", label: "Plants", type: "Class" } },
          { data: { id: "sunlight", label: "Sunlight", type: "Concept" } },
          { data: { id: "energy", label: "Energy", type: "Concept" } },
          { data: { id: "chlorophyll", label: "Chlorophyll", type: "Concept" } }
        ],
        edges: [
          { 
            data: { 
              source: "photosynthesis", 
              target: "plants", 
              label: "performed_by", 
              explanation: "Photosynthesis is a biological process that is performed by plants and other photosynthetic organisms." 
            } 
          },
          { 
            data: { 
              source: "photosynthesis", 
              target: "sunlight", 
              label: "uses", 
              explanation: "Photosynthesis uses sunlight as the primary energy source for the conversion process." 
            } 
          },
          { 
            data: { 
              source: "photosynthesis", 
              target: "energy", 
              label: "produces", 
              explanation: "Photosynthesis produces chemical energy in the form of glucose from light energy." 
            } 
          },
          { 
            data: { 
              source: "photosynthesis", 
              target: "chlorophyll", 
              label: "uses", 
              explanation: "Photosynthesis uses chlorophyll as the key molecule that captures light energy." 
            } 
          },
          { 
            data: { 
              source: "chlorophyll", 
              target: "plants", 
              label: "found_in", 
              explanation: "Chlorophyll is found in the chloroplasts of plant cells." 
            } 
          }
        ]
      }
    }
  },

  // ============================================================================
  // Business Domain
  // ============================================================================
  {
    domain: "Business",
    input: "The marketing department promotes products to customers through advertising campaigns.",
    output: {
      elements: {
        nodes: [
          { data: { id: "marketing", label: "Marketing Department", type: "Class" } },
          { data: { id: "department", label: "Department", type: "Class" } },
          { data: { id: "products", label: "Products", type: "Concept" } },
          { data: { id: "customers", label: "Customers", type: "Class" } },
          { data: { id: "advertising", label: "Advertising Campaigns", type: "Concept" } }
        ],
        edges: [
          { 
            data: { 
              source: "marketing", 
              target: "department", 
              label: "is_a", 
              explanation: "Marketing is a type of department within an organizational structure." 
            } 
          },
          { 
            data: { 
              source: "marketing", 
              target: "products", 
              label: "promotes", 
              explanation: "The marketing department's primary function is to promote products to increase awareness and sales." 
            } 
          },
          { 
            data: { 
              source: "marketing", 
              target: "customers", 
              label: "targets", 
              explanation: "Marketing targets customers as the intended audience for promotional activities." 
            } 
          },
          { 
            data: { 
              source: "marketing", 
              target: "advertising", 
              label: "uses", 
              explanation: "Marketing uses advertising campaigns as a tool to reach and influence customers." 
            } 
          },
          { 
            data: { 
              source: "advertising", 
              target: "products", 
              label: "promotes", 
              explanation: "Advertising campaigns are designed to promote specific products or services." 
            } 
          }
        ]
      }
    }
  },

  // ============================================================================
  // Technology Domain
  // ============================================================================
  {
    domain: "Technology",
    input: "Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming.",
    output: {
      elements: {
        nodes: [
          { data: { id: "machineLearning", label: "Machine Learning", type: "Concept" } },
          { data: { id: "artificialIntelligence", label: "Artificial Intelligence", type: "Concept" } },
          { data: { id: "computers", label: "Computers", type: "Class" } },
          { data: { id: "data", label: "Data", type: "Concept" } },
          { data: { id: "programming", label: "Explicit Programming", type: "Concept" } }
        ],
        edges: [
          { 
            data: { 
              source: "machineLearning", 
              target: "artificialIntelligence", 
              label: "subclass_of", 
              explanation: "Machine learning is a subset or subfield of the broader field of artificial intelligence." 
            } 
          },
          { 
            data: { 
              source: "machineLearning", 
              target: "computers", 
              label: "enables", 
              explanation: "Machine learning enables computers to perform tasks that traditionally required human intelligence." 
            } 
          },
          { 
            data: { 
              source: "computers", 
              target: "data", 
              label: "uses", 
              explanation: "In machine learning, computers use data as the input to learn patterns and make predictions." 
            } 
          },
          { 
            data: { 
              source: "machineLearning", 
              target: "programming", 
              label: "replaces", 
              explanation: "Machine learning replaces the need for explicit programming by learning patterns from data automatically." 
            } 
          }
        ]
      }
    }
  },

  // ============================================================================
  // Healthcare Domain
  // ============================================================================
  {
    domain: "Healthcare",
    input: "Antibiotics are medications that treat bacterial infections by killing bacteria or preventing their growth.",
    output: {
      elements: {
        nodes: [
          { data: { id: "antibiotics", label: "Antibiotics", type: "Class" } },
          { data: { id: "medications", label: "Medications", type: "Class" } },
          { data: { id: "bacterialInfections", label: "Bacterial Infections", type: "Concept" } },
          { data: { id: "bacteria", label: "Bacteria", type: "Class" } }
        ],
        edges: [
          { 
            data: { 
              source: "antibiotics", 
              target: "medications", 
              label: "is_a", 
              explanation: "Antibiotics are a specific type of medication used in medical treatment." 
            } 
          },
          { 
            data: { 
              source: "antibiotics", 
              target: "bacterialInfections", 
              label: "treats", 
              explanation: "Antibiotics are designed to treat bacterial infections in patients." 
            } 
          },
          { 
            data: { 
              source: "antibiotics", 
              target: "bacteria", 
              label: "kills", 
              explanation: "Antibiotics work by killing bacteria or inhibiting their ability to reproduce and grow." 
            } 
          },
          { 
            data: { 
              source: "bacterialInfections", 
              target: "bacteria", 
              label: "caused_by", 
              explanation: "Bacterial infections are caused by the presence and proliferation of harmful bacteria in the body." 
            } 
          }
        ]
      }
    }
  },

  // ============================================================================
  // Education Domain
  // ============================================================================
  {
    domain: "Education",
    input: "A university is an institution that offers undergraduate and graduate programs to students.",
    output: {
      elements: {
        nodes: [
          { data: { id: "university", label: "University", type: "Class" } },
          { data: { id: "institution", label: "Educational Institution", type: "Class" } },
          { data: { id: "undergraduate", label: "Undergraduate Programs", type: "Concept" } },
          { data: { id: "graduate", label: "Graduate Programs", type: "Concept" } },
          { data: { id: "students", label: "Students", type: "Class" } }
        ],
        edges: [
          { 
            data: { 
              source: "university", 
              target: "institution", 
              label: "is_a", 
              explanation: "A university is a type of educational institution that provides higher education." 
            } 
          },
          { 
            data: { 
              source: "university", 
              target: "undergraduate", 
              label: "offers", 
              explanation: "Universities offer undergraduate programs leading to bachelor's degrees." 
            } 
          },
          { 
            data: { 
              source: "university", 
              target: "graduate", 
              label: "offers", 
              explanation: "Universities offer graduate programs leading to master's and doctoral degrees." 
            } 
          },
          { 
            data: { 
              source: "undergraduate", 
              target: "students", 
              label: "targets", 
              explanation: "Undergraduate programs are designed for students pursuing their first degree." 
            } 
          },
          { 
            data: { 
              source: "graduate", 
              target: "students", 
              label: "targets", 
              explanation: "Graduate programs are designed for students pursuing advanced degrees beyond undergraduate." 
            } 
          }
        ]
      }
    }
  }
];

/**
 * Format few-shot examples as a string for inclusion in prompts
 */
export function formatFewShotExamples(maxExamples: number = 3): string {
  const examples = FEW_SHOT_EXAMPLES.slice(0, maxExamples);
  
  return examples.map((example, index) => {
    return `
### Example ${index + 1}: ${example.domain} Domain

**Input:**
"${example.input}"

**Output:**
\`\`\`json
${JSON.stringify(example.output, null, 2)}
\`\`\`
`;
  }).join('\n');
}

/**
 * Get examples for a specific domain
 */
export function getExamplesByDomain(domain: string): FewShotExample[] {
  return FEW_SHOT_EXAMPLES.filter(
    example => example.domain.toLowerCase() === domain.toLowerCase()
  );
}
