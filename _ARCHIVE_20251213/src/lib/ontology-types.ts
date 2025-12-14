/**
 * Standard Ontology Relationship Types
 * 
 * This file defines the canonical set of relationship types used in knowledge graph construction.
 * Using standardized relationship types ensures consistency across different domains and improves
 * graph quality and interpretability.
 */

export const RELATIONSHIP_TYPES = {
  // ============================================================================
  // Hierarchical Relationships (계층 관계)
  // ============================================================================
  
  /** Indicates that the source is a type/instance of the target class */
  IS_A: "is_a",
  
  /** Indicates that the source is a subclass of the target class */
  SUBCLASS_OF: "subclass_of",
  
  /** Indicates that the source is an instance of the target class */
  INSTANCE_OF: "instance_of",
  
  /** Indicates that the source is a type/category of the target */
  TYPE_OF: "type_of",
  
  // ============================================================================
  // Compositional Relationships (구성 관계)
  // ============================================================================
  
  /** Indicates that the source is a part of the target whole */
  PART_OF: "part_of",
  
  /** Indicates that the target is a part of the source whole */
  HAS_PART: "has_part",
  
  /** Indicates that the source contains the target */
  CONTAINS: "contains",
  
  /** Indicates that the source is contained within the target */
  CONTAINED_IN: "contained_in",
  
  /** Indicates that the source is a component of the target system */
  COMPONENT_OF: "component_of",
  
  // ============================================================================
  // Causal Relationships (인과 관계)
  // ============================================================================
  
  /** Indicates that the source causes the target effect */
  CAUSES: "causes",
  
  /** Indicates that the source is caused by the target */
  CAUSED_BY: "caused_by",
  
  /** Indicates that the source enables or makes possible the target */
  ENABLES: "enables",
  
  /** Indicates that the source prevents or inhibits the target */
  PREVENTS: "prevents",
  
  /** Indicates that the source leads to or results in the target */
  LEADS_TO: "leads_to",
  
  /** Indicates that the source produces or generates the target */
  PRODUCES: "produces",
  
  // ============================================================================
  // Property Relationships (속성 관계)
  // ============================================================================
  
  /** Indicates that the source has the target property */
  HAS_PROPERTY: "has_property",
  
  /** Indicates that the source has the target attribute */
  HAS_ATTRIBUTE: "has_attribute",
  
  /** Indicates that the source is characterized by the target */
  CHARACTERIZED_BY: "characterized_by",
  
  /** Indicates that the source has the target quality */
  HAS_QUALITY: "has_quality",
  
  // ============================================================================
  // Associative Relationships (연관 관계)
  // ============================================================================
  
  /** General relationship indicating association between source and target */
  RELATED_TO: "related_to",
  
  /** Indicates that the source is associated with the target */
  ASSOCIATED_WITH: "associated_with",
  
  /** Indicates that the source influences the target */
  INFLUENCES: "influences",
  
  /** Indicates that the source is influenced by the target */
  INFLUENCED_BY: "influenced_by",
  
  /** Indicates that the source depends on the target */
  DEPENDS_ON: "depends_on",
  
  /** Indicates that the source interacts with the target */
  INTERACTS_WITH: "interacts_with",
  
  // ============================================================================
  // Temporal Relationships (시간 관계)
  // ============================================================================
  
  /** Indicates that the source occurs before the target */
  PRECEDES: "precedes",
  
  /** Indicates that the source occurs after the target */
  FOLLOWS: "follows",
  
  /** Indicates that the source occurs during the target */
  DURING: "during",
  
  /** Indicates that the source occurs simultaneously with the target */
  SIMULTANEOUS_WITH: "simultaneous_with",
  
  // ============================================================================
  // Functional Relationships (기능 관계)
  // ============================================================================
  
  /** Indicates that the source has the target role */
  HAS_ROLE: "has_role",
  
  /** Indicates that the source performs the target action/function */
  PERFORMS: "performs",
  
  /** Indicates that the source is performed by the target agent */
  PERFORMED_BY: "performed_by",
  
  /** Indicates that the source uses the target resource */
  USES: "uses",
  
  /** Indicates that the source is used by the target */
  USED_BY: "used_by",
  
  /** Indicates that the source applies to the target */
  APPLIES_TO: "applies_to",
  
  /** Indicates that the source implements the target */
  IMPLEMENTS: "implements",
  
  // ============================================================================
  // Spatial Relationships (공간 관계)
  // ============================================================================
  
  /** Indicates that the source is located in/at the target */
  LOCATED_IN: "located_in",
  
  /** Indicates that the source is found in the target location */
  FOUND_IN: "found_in",
  
  /** Indicates that the source is adjacent to the target */
  ADJACENT_TO: "adjacent_to",
  
  // ============================================================================
  // Domain-Specific Relationships
  // ============================================================================
  
  /** Business: Indicates that the source manages the target */
  MANAGES: "manages",
  
  /** Business: Indicates that the source is managed by the target */
  MANAGED_BY: "managed_by",
  
  /** Business: Indicates that the source owns the target */
  OWNS: "owns",
  
  /** Science: Indicates that the source carries the target (e.g., DNA carries genetic info) */
  CARRIES: "carries",
  
  /** Science: Indicates that the source converts to the target */
  CONVERTS_TO: "converts_to",
  
  /** Marketing: Indicates that the source promotes the target */
  PROMOTES: "promotes",
  
  /** Marketing: Indicates that the source targets the target audience */
  TARGETS: "targets",
  
} as const;

/**
 * Type for relationship type values
 */
export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES];

/**
 * Get all relationship type values as an array
 */
export function getAllRelationshipTypes(): RelationshipType[] {
  return Object.values(RELATIONSHIP_TYPES);
}

/**
 * Check if a given string is a valid relationship type
 */
export function isValidRelationshipType(type: string): type is RelationshipType {
  return getAllRelationshipTypes().includes(type as RelationshipType);
}

/**
 * Relationship type descriptions for documentation
 */
export const RELATIONSHIP_DESCRIPTIONS: Record<RelationshipType, string> = {
  // Hierarchical
  is_a: "The source is a type or instance of the target class",
  subclass_of: "The source is a subclass of the target class",
  instance_of: "The source is an instance of the target class",
  type_of: "The source is a type or category of the target",
  
  // Compositional
  part_of: "The source is a part of the target whole",
  has_part: "The target is a part of the source whole",
  contains: "The source contains the target",
  contained_in: "The source is contained within the target",
  component_of: "The source is a component of the target system",
  
  // Causal
  causes: "The source causes the target effect",
  caused_by: "The source is caused by the target",
  enables: "The source enables or makes possible the target",
  prevents: "The source prevents or inhibits the target",
  leads_to: "The source leads to or results in the target",
  produces: "The source produces or generates the target",
  
  // Property
  has_property: "The source has the target property",
  has_attribute: "The source has the target attribute",
  characterized_by: "The source is characterized by the target",
  has_quality: "The source has the target quality",
  
  // Associative
  related_to: "General relationship indicating association",
  associated_with: "The source is associated with the target",
  influences: "The source influences the target",
  influenced_by: "The source is influenced by the target",
  depends_on: "The source depends on the target",
  interacts_with: "The source interacts with the target",
  
  // Temporal
  precedes: "The source occurs before the target",
  follows: "The source occurs after the target",
  during: "The source occurs during the target",
  simultaneous_with: "The source occurs simultaneously with the target",
  
  // Functional
  has_role: "The source has the target role",
  performs: "The source performs the target action/function",
  performed_by: "The source is performed by the target agent",
  uses: "The source uses the target resource",
  used_by: "The source is used by the target",
  applies_to: "The source applies to the target",
  implements: "The source implements the target",
  
  // Spatial
  located_in: "The source is located in/at the target",
  found_in: "The source is found in the target location",
  adjacent_to: "The source is adjacent to the target",
  
  // Domain-specific
  manages: "The source manages the target",
  managed_by: "The source is managed by the target",
  owns: "The source owns the target",
  carries: "The source carries the target",
  converts_to: "The source converts to the target",
  promotes: "The source promotes the target",
  targets: "The source targets the target audience",
};
