# 온톨로지 스키마 문서 (v1.0)

## 1. 개요 (Overview)
이 스키마는 **개인화된 지식 그래프(Personal Knowledge Graph)** 구축을 목적으로 설계되었습니다.  
**LPG(Labeled Property Graph)** 모델을 따르며, Neo4j 데이터베이스에 최적화되어 있습니다.

## 2. 핵심 컨셉 (Core Concepts)

### 2.1. 중심성 (Person-Centric)
모든 데이터는 `Person`(사용자)을 중심으로 연결됩니다.  
사용자는 자신의 '디지털 트윈'으로서 그래프 상에 존재하며, 모든 기억(Event), 능력(Skill), 관심사(Interest)가 이 노드로부터 파생됩니다.

### 2.2. 시간적 접지 (Temporal Grounding)
- **정적 속성 (Static)**: 변하지 않는 정보는 노드의 속성(Property)으로 저장합니다. (예: `Person.birthDate`)
- **동적 속성 (Dynamic)**: 시간에 따라 변하는 정보는 **관계(Relationships)** 의 속성이나 **이벤트(Event)** 노드로 분리합니다.
    - 예: "삼성전자에 다녔다" -> `(:Person)-[:BELONGS_TO {start_date: '2020', end_date: '2023'}]->(:Organization {name: 'Samsung'})`

## 3. 노드 및 관계 정의 (Schema Definition)

### Nodes
| Label | Description | 주요 속성 (Properties) |
|---|---|---|
| **Person** | 사용자 또는 관련 인물 | `name`, `email`, `birthDate`, `exclude_from_search` |
| **Event** | 경험, 기억, 사건 | `id`, `title`, `date`, `summary`, `sentiment` |
| **Organization** | 회사, 학교, 그룹 | `name`, `industry`, `location` |
| **Skill** | 보유 기술 | `name`, `category` (예: Programming, Language) |
| **Interest** | 관심사 | `topic` (예: AI, Hiking) |

### Relationships
| Type | From | To | Description |
|---|---|---|---|
| **EXPERIENCED** | Person | Event | 특정 사건을 경험함 |
| **BELONGS_TO** | Person | Organization | 소속됨 (직장, 학교 등) |
| **HAS_SKILL** | Person | Skill | 기술을 보유함 |
| **INTERESTED_IN** | Person | Interest | 관심이 있음 |
| **OCCURRED_AT** | Event | Location | 사건이 발생한 장소 |

## 4. 확장성 (Extensibility)
향후 `GraphRAG` 구현 시, 이 스키마는 벡터 임베딩과 결합됩니다.
- 각 `Event`, `Interest` 노드는 텍스트 임베딩 벡터를 가질 수 있어, 의미론적 검색(Semantic Search)이 가능합니다.
