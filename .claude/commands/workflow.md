---
name: workflow
description: Execute complete development workflow with Agent assignment
usage: /workflow <feature-name> [priority]
---

# Development Workflow Command

## Overview
Executes a complete requirements development process with user-controlled progression and automatic progress tracking. Each stage requires user confirmation before proceeding.

## Execution Flow

```bash
# Start development workflow
/workflow [feature-name] [priority]

# System execution sequence:
# 1. Create /PRPs/[YYYY-MM-DD] folder (skip if exists)
# 2. Follow the following Workflow Stages to execute
# 3. Every stage finally update progress document with completed tasks
```

**Parameters:**
- `feature-name`: Feature name (required)
- `priority`: Priority level [high|medium|low] (optional, default: medium)

**Output Structure:**

```
/PRPs/[YYYY-MM-DD]/                        # Date-based folder
├── [feature-name]-progress.md             # Progress tracking document (auto-generated)
├── [feature-name]-prd.md                  # Product requirements
├── [feature-name]-design.md               # Design specifications
├── [feature-name]-tech.md                 # Technical architecture
└── [feature-name]-qa.md                   # Quality assurance
```

## Workflow Stages

### Stage 1: Product Planning & Requirements Analysis
**Agent:** product-manager

**Tasks:** (User confirmation required before execution)
- [ ] Generate Product Requirements Prompt (PRP) document
- [ ] Market research and competitive analysis
- [ ] User stories and acceptance criteria definition
- [ ] Save PRP to `/PRPs/[YYYY-MM-DD]/[feature-name]-prd.md`

**Outputs:**
- Complete PRP document with user stories and acceptance criteria

### Stage 2: User Experience Design
**Agent:** ui-ux-designer

**Tasks:** (User confirmation required before execution)
- [ ] Create user journey maps based on PRP
- [ ] Design system and component specifications
- [ ] User interface mockups and prototypes
- [ ] Design system updates and maintenance
- [ ] Save design specifications to `/PRPs/[YYYY-MM-DD]/[feature-name]-design.md`

**Dependencies:** PRP document
**Outputs:**
- User interface designs
- Interactive prototypes
- Design system specifications

### Stage 3: Technical Architecture Planning
**Agent:** frontend-developer

**Tasks:** (User confirmation required before execution)
- [ ] Technical feasibility assessment
- [ ] Frontend architecture design and component planning
- [ ] API interface design and data flow planning
- [ ] Performance optimization strategy
- [ ] Technology stack selection and dependency management
- [ ] Development environment and build process configuration
- [ ] Save technical specifications to `/PRPs/[YYYY-MM-DD]/[feature-name]-tech.md`

**Dependencies:** PRP document, UI/UX designs
**Outputs:**
- Technical architecture document
- Component design specifications
- Development plan

### Stage 4: Code Review & Quality Assurance
**Agent:** code-reviewer

**Tasks:** (User confirmation required before execution)
- [ ] Code quality standards definition
- [ ] Security and performance review strategy
- [ ] Testing strategy and quality gates setup
- [ ] CI/CD process configuration
- [ ] Code standards and best practices checklist
- [ ] Production readiness assessment
- [ ] Save quality assurance plan to `/PRPs/[YYYY-MM-DD]/[feature-name]-qa.md`

**Dependencies:** Technical architecture, Development plan
**Outputs:**
- Code review checklist
- Quality assurance strategy
- Testing plan

## User Interaction Pattern

Each stage execution follows this pattern:
1. **Stage Confirmation**: System prompts "Execute [Stage Name] with @[agent-name]? [y/n]"
2. **Task Execution**: If confirmed, agent executes all tasks in the stage
3. **Progress Update**: System updates progress document with [x] for completed tasks
4. **Output Validation**: User reviews generated documentation
5. **Next Stage**: System prompts for next stage execution

## Progress Tracking Document

The system automatically creates and maintains a progress tracking document:

**File**: `/PRPs/[YYYY-MM-DD]/[feature-name]-progress.md`

```markdown
# Feature Development Progress: [feature-name]

**Created**: YYYY-MM-DD HH:mm:ss
**Priority**: high|medium|low
**Status**: in-progress|completed|paused

## Progress Overview
- **Stage 1**: Product Planning & Requirements Analysis [⏳|✅|❌]
- **Stage 2**: User Experience Design [⏳|✅|❌]
- **Stage 3**: Technical Architecture Planning [⏳|✅|❌]
- **Stage 4**: Code Review & Quality Assurance [⏳|✅|❌]

## Detailed Progress

### Stage 1: Product Planning & Requirements Analysis
**Assignee**: product-manager
**Status**: pending|in-progress|completed
**Started**: YYYY-MM-DD HH:mm:ss
**Completed**: YYYY-MM-DD HH:mm:ss

**Tasks:**
- [ ] Generate Product Requirements Prompt (PRP) document
- [ ] Market research and competitive analysis
- [ ] User stories and acceptance criteria definition
- [ ] Business value assessment and priority confirmation
- [ ] Risk identification and mitigation strategies
- [ ] Save PRP to `/PRPs/[YYYY-MM-DD]/[feature-name]-prd.md`

**Outputs:**
- [ ] Complete PRP document
- [ ] User research plan
- [ ] Feature priority matrix

### Stage 2: User Experience Design
**Assignee**: ui-ux-designer
**Status**: pending|in-progress|completed
**Dependencies**: Stage 1 completion

**Tasks:**
- [ ] Create user journey maps based on PRP
- [ ] Design system and component specifications
- [ ] User interface mockups and prototypes
- [ ] Accessibility design validation
- [ ] Design system updates and maintenance
- [ ] PC and mobile adaptation and consistency check
- [ ] Save design specifications to `/PRPs/[YYYY-MM-DD]/[feature-name]-design.md`

### Stage 3: Technical Architecture Planning
**Assignee**: frontend-developer
**Status**: pending|in-progress|completed
**Dependencies**: Stage 1 and 2 completion

**Tasks:**
- [ ] Technical feasibility assessment
- [ ] Frontend architecture design and component planning
- [ ] API interface design and data flow planning
- [ ] Performance optimization strategy
- [ ] Technology stack selection and dependency management
- [ ] Development environment and build process configuration
- [ ] Save technical specifications to `/PRPs/[YYYY-MM-DD]/[feature-name]-tech.md`

### Stage 4: Code Review & Quality Assurance
**Assignee**: code-reviewer
**Status**: pending|in-progress|completed
**Dependencies**: Stage 3 completion

**Tasks:**
- [ ] Code quality standards definition
- [ ] Security and performance review strategy
- [ ] Testing strategy and quality gates setup
- [ ] CI/CD process configuration
- [ ] Code standards and best practices checklist
- [ ] Production readiness assessment
- [ ] Save quality assurance plan to `/PRPs/[YYYY-MM-DD]/[feature-name]-qa.md`
```

## User Confirmation Commands

During execution, users can use these commands:
- `y` or `yes` - Proceed with current stage
- `n` or `no` - Skip current stage
- `s` or `status` - Show current progress
- `q` or `quit` - Exit workflow (saves progress)
- `r` or `review` - Review outputs before proceeding
