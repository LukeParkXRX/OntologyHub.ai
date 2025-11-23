"use client";

import { Brain, Sparkles, Maximize2, Eye, Palette, Zap, FileText } from "lucide-react";
import Link from "next/link";

export default function VersionPage() {
    const versions = [
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
                            v0.2.0 Beta
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
                            <span>버전 히스토리</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 mb-6">
                            업데이트 내역
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            OntologyHub.AI의 새로운 기능과 개선 사항을 확인하세요
                        </p>
                    </div>
                </section>

                {/* Version Timeline */}
                <section className="py-8">
                    <div className="container max-w-4xl mx-auto px-6">
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
