# BoN Jailbreaking Rig 🎯

A comprehensive AI red team testing platform for systematic prompt injection and jailbreaking research using Best-of-N (BoN) strategies.

![Seed Prompt Interface](images/Seed_Prompt.png)

## Overview

The **BoN Jailbreaking Rig** is a human-in-the-loop platform designed for AI safety researchers to systematically test language model robustness against adversarial prompts. It combines automated prompt generation with human evaluation to identify potential vulnerabilities in AI systems.

### Key Features

- **🎯 Best-of-N Strategy**: Generate multiple prompt variants and automatically select the most effective ones
- **🔬 Attack Technique Library**: Comprehensive collection of proven jailbreaking methods from AI safety research
- **👥 Human-in-the-Loop Evaluation**: Structured workflow for researchers to assess model responses
- **🧬 Genetic Algorithm Evolution**: AutoDAN-inspired prompt mutation and optimization
- **🔍 Vector Similarity Search**: Semantic analysis for prompt clustering and pattern detection
- **📊 Response Analysis**: Systematic evaluation with confidence scoring and pattern matching

![Response Evaluation](images/ResponseEvaluation.png)

## Core Capabilities

### Prompt Generation & Mutation
The platform supports multiple prompt generation strategies:
- **Template-based generation** using proven attack patterns
- **LLM-assisted variant creation** for creative prompt evolution
- **Genetic algorithm mutations** for systematic prompt optimization

![Prompt Mutation](images/PromptMutation.png)

### Evaluation Methods
- **Binary Assessment**: Simple pass/fail evaluation for quick screening
- **ASR (Attack Success Rate)**: Pattern-based automated scoring
- **Hybrid Evaluation**: Combined automated and human assessment
- **Confidence Scoring**: Reliability metrics for evaluation results

### Research Workflow
1. **Session Setup**: Create targeted testing campaigns for specific AI models
2. **Seed Prompt Selection**: Choose base prompts from curated library
3. **Attack Technique Application**: Apply various jailbreaking methods
4. **Variant Generation**: Create multiple prompt variations using BoN strategy
5. **Response Collection**: Gather model outputs for analysis
6. **Human Evaluation**: Expert assessment of response safety and compliance
7. **Pattern Analysis**: Identify successful attack vectors and model vulnerabilities

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+ (recommended) or SQLite for development
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bon-jailbreaking-rig.git
   cd bon-jailbreaking-rig
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend (port 50000)
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 50000

   # Terminal 2 - Frontend (port 60000)
   cd frontend
   npm run dev
   ```

5. **Access the platform**
   - Application: http://localhost:60000
   - API: http://localhost:50000
   - Health Check: http://localhost:50000/api/health

## Technology Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **Frontend**: React + Vite + Tailwind CSS
- **Theme**: Synthwave aesthetic optimized for red team operations
- **Database**: Vector similarity search with pgvector extension
- **AI Integration**: Compatible with OpenAI, Anthropic, and local model APIs

## Use Cases

### AI Safety Research
- Systematic evaluation of model safety guardrails
- Discovery of novel jailbreaking techniques
- Benchmarking robustness across different model versions
- Publication-ready data collection and analysis

### Red Team Operations
- Structured adversarial testing workflows
- Team collaboration on prompt development
- Historical tracking of successful attack vectors
- Reproducible testing methodologies

### Model Development
- Pre-deployment safety validation
- Iterative improvement of safety measures
- Comparison testing between model versions
- Integration with existing ML pipelines

## Research Applications

This platform has been designed to support rigorous AI safety research with:
- **Reproducible methodologies** for consistent testing across research teams
- **Standardized evaluation metrics** for comparing results across studies
- **Comprehensive logging** for audit trails and result verification
- **Export capabilities** for integration with academic publication workflows

## Contributing

We welcome contributions from the AI safety research community. Please see our contribution guidelines for:
- Code style and testing requirements
- New attack technique submissions
- Documentation improvements
- Bug reports and feature requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## Attribution

This project builds upon several important works in AI safety research:

- **Arcanum Prompt Injection Taxonomy**: This methodology is based on the [Arcanum Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy/) by Jason Haddix ([Arcanum Information Security](https://arcanum-sec.com/)).
- **BoN Jailbreaking Research**: Inspired by methodologies from [jplhughes/bon-jailbreaking](https://github.com/jplhughes/bon-jailbreaking).
- **Deck of Many Prompts**: Incorporates techniques from the [peluche/deck-of-many-prompts](https://github.com/peluche/deck-of-many-prompts) project.

## Citation

If you use this platform in your research, please cite:

```bibtex
@software{bon_jailbreaking_rig,
  title={BoN Jailbreaking Rig: A Human-in-the-Loop Platform for AI Red Team Testing},
  author={[Your Name/Organization]},
  year={2024},
  url={https://github.com/your-org/bon-jailbreaking-rig}
}
```

## Security Notice

This tool is designed exclusively for defensive AI safety research. Users are responsible for ensuring ethical use and compliance with applicable laws and regulations. The platform includes safety measures to prevent misuse, but researchers should follow responsible disclosure practices for any vulnerabilities discovered.

---

**⚠️ Research Use Only**: This platform is intended for legitimate AI safety research and should not be used for malicious purposes. Please use responsibly and in accordance with your organization's ethics guidelines.