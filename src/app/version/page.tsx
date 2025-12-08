"use client";

import { Brain, Sparkles, Maximize2, Eye, Palette, Zap, FileText, Users, Globe, Cloud, Heart } from "lucide-react";
import Link from "next/link";

export default function VersionPage() {
    const roadmap = [
        {
            phase: "Phase 1",
            title: "기반 구축 & 사용자 경험",
            description: "직관적인 그래프 에디터, 개인화된 저장소, 자연어 기반 생성 고도화",
            status: "In Progress",
            icon: Brain
        },
        {
            phase: "Phase 2",
            title: "지식 공유 & 협업",
            description: "공유 링크 생성, 팀 워크스페이스, 버전 관리 시스템",
            status: "Planned",
            icon: Users
        },
        {
            phase: "Phase 3",
            title: "도메인 확장 & 통합",
            description: "도메인별 템플릿, 그래프 병합(Merge), 공용 지식 베이스",
            status: "Planned",
            icon: Globe
        },
        {
            phase: "Phase 4",
            title: "API & SaaS 생태계",
            description: "REST/GraphQL API, SDK 제공, 구독 모델 도입",
            status: "Planned",
            icon: Cloud
        },
        {
            phase: "Phase 5",
            title: "AI '존재' 구현",
            description: "기억 메모리 시스템, 페르소나 모듈, 감정 및 공감 엔진",
            status: "Vision",
            icon: Heart
        }
    ];

    const versions = [
        {
            date: "2025-12-05",
            version: "v0.4.0",
            title: "AI 프롬프트 엔지니어링 대폭 개선",
            features: [
                {
                    icon: Brain,
                    name: "관계 타입 온톨로지 정의",
                    description: "50개 이상의 표준 관계 타입을 9개 카테고리로 분류하여 정의했습니다. 계층(is_a, subclass_of), 구성(part_of, contains), 인과(causes, enables), 속성(has_property), 연관(influences, depends_on), 시간(precedes, follows), 기능(performs, uses), 공간(located_in), 도메인별(manages, promotes) 관계를 포함하여 일관성 있는 그래프 생성이 가능합니다.",
                },
                {
                    icon: Sparkles,
                    name: "Few-Shot 학습 예시 추가",
                    description: "Science, Business, Technology, Healthcare, Education 5개 도메인의 고품질 예시를 AI 프롬프트에 포함했습니다. 각 예시는 명확한 노드 구조, 표준 관계 타입 사용, 상세한 설명을 포함하여 AI가 도메인별로 더 정확한 온톨로지를 생성할 수 있도록 학습시킵니다.",
                },
                {
                    icon: Zap,
                    name: "자동 중복 노드 제거",
                    description: "Levenshtein distance 알고리즘을 활용한 유사도 기반 중복 노드 감지 및 자동 병합 기능이 추가되었습니다. 85% 이상 유사한 노드는 자동으로 하나로 통합되며, 관련 엣지도 자동으로 재연결되어 깔끔한 그래프 구조를 유지합니다.",
                },
                {
                    icon: Eye,
                    name: "그래프 품질 메트릭 추적",
                    description: "생성된 그래프의 품질을 실시간으로 측정하고 로깅합니다. 총 노드/엣지 수, 고립 노드 비율, 평균 엣지 수, explanation 완성도 등의 메트릭을 브라우저 콘솔에서 확인할 수 있어 AI 성능을 모니터링할 수 있습니다.",
                },
                {
                    icon: FileText,
                    name: "프롬프트 구조 개선",
                    description: "AI 프롬프트를 120줄 이상의 상세한 지침으로 재구성했습니다. 표준 관계 타입 목록, Few-Shot 예시, 4단계 작업 지침, 명확한 출력 형식, MUST/SHOULD/MUST NOT 품질 제약, 6가지 검증 체크리스트를 포함하여 일관성 있고 고품질의 그래프를 생성합니다.",
                },
                {
                    icon: Brain,
                    name: "그래프 연결성 검증",
                    description: "BFS(Breadth-First Search) 알고리즘을 사용하여 생성된 그래프의 연결성을 자동으로 검증합니다. 고립된 노드가 감지되면 경고 로그를 출력하여 AI 응답 품질을 모니터링할 수 있습니다.",
                },
                {
                    icon: Palette,
                    name: "예상 품질 향상",
                    description: "이번 개선으로 관계 타입 일관성 80% 이상, 중복 노드 발생률 5% 이하, 도메인별 정확도 20-30% 향상이 예상됩니다. 사용자는 더 정확하고 이해하기 쉬운 지식 그래프를 경험할 수 있습니다.",
                },
            ],
        },
        {
            date: "2025-11-23",
            version: "v0.3.0",
            title: "배포 및 인증 시스템 구축",
            features: [
                {
                    icon: Zap,
                    name: "Vercel 프로덕션 배포",
                    description: "OntologyHub.AI가 Vercel 플랫폼에 성공적으로 배포되었습니다. 전 세계 어디서나 빠르고 안정적으로 접속할 수 있습니다.",
                },
                {
                    icon: Brain,
                    name: "Google OAuth 인증 통합",
                    description: "Google 계정으로 간편하게 로그인할 수 있는 OAuth 2.0 인증 시스템이 구축되었습니다. NextAuth.js를 활용하여 안전하고 편리한 사용자 인증을 제공합니다.",
                },
                {
                    icon: Sparkles,
                    name: "Supabase 데이터베이스 연동",
                    description: "PostgreSQL 기반의 Supabase 데이터베이스가 연동되어 사용자 데이터와 그래프 정보를 안전하게 저장하고 관리할 수 있습니다.",
                },
                {
                    icon: FileText,
                    name: "환경 변수 관리 개선",
                    description: "로컬 개발 환경과 프로덕션 환경의 환경 변수를 분리하여 관리합니다. 민감한 API 키와 시크릿은 안전하게 보호됩니다.",
                },
                {
                    icon: Zap,
                    name: "인증 리디렉션 문제 해결",
                    description: "NextAuth 설정에서 커스텀 signIn 페이지 설정을 제거하여 무한 리디렉션 루프 문제를 해결했습니다. 로그인 프로세스가 정상적으로 작동합니다.",
                },
                {
                    icon: Brain,
                    name: "GitHub 저장소 연동",
                    description: "소스 코드가 GitHub에 안전하게 저장되며, Vercel과 자동 배포 파이프라인이 구축되어 코드 변경 시 자동으로 재배포됩니다.",
                },
            ],
        },
        {
            date: "2025-11-22",
            version: "v0.2.0",
            title: "시각 효과 & 사용성 개선",
            features: [
                {
                    icon: Palette,
                    name: "확장 레이어별 컬러 코딩",
                    description: "그래프 확장 시 각 단계마다 파스텔 컬러가 자동 적용됩니다. 초기 생성은 보라색, 첫 번째 확장은 블루, 두 번째는 민트, 세 번째는 핑크, 네 번째는 앰버 색상으로 표시되어 어느 노드에서 확장되었는지 한눈에 파악할 수 있습니다.",
                },
                {
                    icon: Zap,
                    name: "그래프 생성 애니메이션",
                    description: "AI가 지식을 분석하는 과정을 시각화하는 1.2초 길이의 신비로운 애니메이션 효과. 중앙에서 맥동하는 에너지 코어, 퍼져나가는 파동, 유령 형태의 노드 미리보기가 Canvas 기반으로 부드럽게 렌더링됩니다.",
                },
                {
                    icon: Eye,
                    name: "노드/관계 상세 정보 패널",
                    description: "노드를 클릭하면 라벨, ID, 타입 정보를 확인할 수 있고, 엣지(관계선)를 클릭하면 관계 이름과 함께 AI가 생성한 '왜 두 개념이 연결되어 있는지'에 대한 설명을 우측 패널에서 볼 수 있습니다.",
                },
                {
                    icon: Maximize2,
                    name: "전체화면 모드",
                    description: "그래프 우측 상단의 Fullscreen 버튼을 클릭하면 Input Source 패널이 숨겨지고 그래프가 브라우저 전체 화면으로 확장됩니다. X 버튼으로 다시 일반 모드로 돌아올 수 있습니다.",
                },
                {
                    icon: FileText,
                    name: "키보드 단축키 지원",
                    description: "Input Source 입력창에서 Ctrl+Enter (Mac은 Cmd+Enter)를 누르면 마우스 클릭 없이 바로 그래프를 생성할 수 있습니다. 우측 하단에 힌트가 표시됩니다.",
                },
                {
                    icon: Brain,
                    name: "Input Source 창 크기 고정",
                    description: "전체화면 모드를 사용해도 Input Source 패널이 항상 일정한 크기(600px)를 유지하여 UI 일관성을 보장합니다.",
                },
                {
                    icon: Sparkles,
                    name: "로고 클릭 홈 이동",
                    description: "상단 헤더의 OntologyHub.AI 로고를 클릭하면 메인 페이지로 이동합니다.",
                },
                {
                    icon: FileText,
                    name: "About 페이지 추가",
                    description: "OntologyHub.AI의 미션, 비전, 제공 기능을 소개하는 세련된 About 페이지가 추가되었습니다.",
                },
                {
                    icon: Zap,
                    name: "JSON 파싱 개선",
                    description: "OpenAI가 마크다운 코드 블록으로 감싼 응답을 보내도 자동으로 처리하여 오류를 방지합니다.",
                },
            ],
        },
        {
            date: "2025-11-21",
            version: "v0.1.0",
            title: "초기 출시",
            features: [
                {
                    icon: Brain,
                    name: "AI 기반 지식 그래프 생성",
                    description: "텍스트를 입력하면 OpenAI GPT-4가 개념(노드)과 관계(엣지)를 자동으로 추출하여 Cytoscape.js 기반의 인터랙티브한 지식 그래프로 시각화합니다. 복잡한 온톨로지 구조도 직관적으로 이해할 수 있습니다.",
                },
                {
                    icon: Sparkles,
                    name: "대화형 그래프 탐색 & 확장",
                    description: "생성된 그래프의 노드를 클릭하면 해당 개념을 중심으로 관련된 하위 개념, 예시, 관계를 추가로 생성하여 그래프를 점진적으로 확장할 수 있습니다. 기존 노드는 유지되며 새로운 노드만 추가됩니다.",
                },
                {
                    icon: Palette,
                    name: "세련된 다크 테마 UI",
                    description: "깊은 네이비/블랙 배경에 바이올렛 액센트를 사용한 고급스러운 다크 모드 인터페이스. 글래스모피즘 카드, 그라데이션 텍스트, 부드러운 애니메이션으로 프리미엄 사용자 경험을 제공합니다.",
                },
                {
                    icon: Zap,
                    name: "AI 네트워크 배경 애니메이션",
                    description: "그래프가 생성되기 전 빈 상태일 때 표시되는 동적인 네트워크 애니메이션. 떠다니는 노드와 연결선이 Canvas로 렌더링되어 미래지향적인 분위기를 연출합니다.",
                },
                {
                    icon: FileText,
                    name: "그래프 데이터 내보내기",
                    description: "생성된 지식 그래프를 JSON 파일로 다운로드할 수 있는 Export JSON 기능. 데이터를 저장하고 재사용할 수 있습니다.",
                },
                {
                    icon: Brain,
                    name: "스마트 노드 병합 시스템",
                    description: "그래프 확장 시 중복된 노드는 자동으로 필터링되고, 새로운 노드만 기존 그래프에 추가됩니다. 엣지도 중복 검사를 거쳐 깔끔한 그래프 구조를 유지합니다.",
                },
                {
                    icon: Sparkles,
                    name: "반응형 레이아웃",
                    description: "데스크톱, 태블릿, 모바일 등 다양한 화면 크기에 최적화된 반응형 디자인으로 어떤 기기에서도 편리하게 사용할 수 있습니다.",
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
                <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Brain className="h-5 w-5 text-primary" />
                            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                            OntologyHub<span className="text-primary">.AI</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="text-foreground/60 hover:text-primary transition-colors">Graph Engine</Link>
                        <Link href="/version" className="text-foreground/80 hover:text-primary transition-colors">버전</Link>
                        <Link href="/about" className="text-foreground/60 hover:text-primary transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-foreground/70">
                            v0.4.0 Beta
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 opacity-40 pointer-events-none" />

                    <div className="container max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>버전 히스토리 & 로드맵</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 mb-6">
                            비전 & 업데이트
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            OntologyHub.AI는 AI에게 "존재"를 부여하기 위한 여정을 시작했습니다.
                        </p>
                    </div>
                </section>

                {/* Roadmap Section */}
                <section className="py-12 border-b border-white/5">
                    <div className="container max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Future Roadmap</h2>
                            <p className="text-muted-foreground">우리가 나아갈 방향과 목표입니다</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roadmap.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className={`p-6 rounded-2xl border bg-card/30 backdrop-blur-sm transition-all hover:border-primary/50 group ${item.status === "Vision" ? "lg:col-span-2 lg:col-start-2 border-primary/30 bg-primary/5" : "border-white/10"}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-lg ${item.status === "Vision" ? "bg-primary/20" : "bg-white/5"} group-hover:scale-110 transition-transform`}>
                                                <Icon className={`h-6 w-6 ${item.status === "Vision" ? "text-primary" : "text-foreground/70"}`} />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${item.status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                                                    item.status === "Vision" ? "bg-primary/20 text-primary" :
                                                        "bg-white/5 text-muted-foreground"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{item.phase}</span>
                                            <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Version Timeline */}
                <section className="py-16">
                    <div className="container max-w-4xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Update History</h2>
                        </div>
                        <div className="space-y-12">
                            {versions.map((version, versionIndex) => (
                                <div key={version.date} className="relative">
                                    {/* Timeline Line */}
                                    {versionIndex !== versions.length - 1 && (
                                        <div className="absolute left-[23px] top-16 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 to-transparent" />
                                    )}

                                    {/* Version Header */}
                                    <div className="flex items-start gap-6 mb-6">
                                        <div className="relative flex-shrink-0">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                                                <Sparkles className="h-6 w-6 text-primary" />
                                            </div>
                                            {versionIndex === 0 && (
                                                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>

                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold">{version.version}</h2>
                                                {versionIndex === 0 && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                                                        최신
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xl text-foreground/80 mb-1">{version.title}</p>
                                            <p className="text-sm text-muted-foreground">{version.date}</p>
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <div className="ml-[72px] space-y-4">
                                        {version.features.map((feature, featureIndex) => {
                                            const Icon = feature.icon;
                                            return (
                                                <div
                                                    key={featureIndex}
                                                    className="p-4 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm hover:border-primary/30 transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                            <Icon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-foreground mb-1">{feature.name}</h3>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                {feature.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 border-t border-white/5 mt-12">
                    <div className="container max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-4">새로운 기능을 직접 체험해보세요</h2>
                        <p className="text-muted-foreground mb-8">
                            지금 바로 OntologyHub.AI에서 지식 그래프를 생성하고 탐색해보세요
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
                        >
                            시작하기
                            <Sparkles className="h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="container max-w-screen-2xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>© 2025 OntologyHub.AI • Building the future of knowledge-powered AI</p>
                </div>
            </footer>
        </div>
    );
}
