# 📝 Todo App - Complete Deployment Guide

A simple yet powerful Todo application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring multiple deployment strategies and automated CI/CD pipeline.

## 🚀 Features

- ✅ Add, complete, and delete tasks
- 💾 Persistent data storage with MongoDB
- 📱 Responsive React frontend
- 🐳 Containerized with Docker
- ☸️ Kubernetes-ready deployments
- 🔄 GitOps with ArgoCD
- 🤖 Automated CI/CD pipeline

## 📋 Prerequisites

Before you start, make sure you have:

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (for Kubernetes deployment)
- [ArgoCD](https://argo-cd.readthedocs.io/en/stable/getting_started/) (for GitOps deployment)
- AWS Account (for ECR and App Runner)
- Docker Hub Account

## 🏗️ Project Structure

```
Todo-app/
├── 📁 server/                      # Backend code (Node.js + Express)
├── 🐳 Dockerfile                   # Container image definition
├── 🐳 docker-compose.yaml          # Multi-container setup
├── 📁 kubernetes/                  # Kubernetes deployment files
│   ├── namespace.yaml              # Isolated namespace
│   ├── mongodb-pvc.yaml            # Persistent storage
│   ├── mongodb-deployment-service.yaml  # MongoDB deployment
│   └── argocd-app.yaml             # GitOps configuration
├── 🔄 .github/workflows/           # CI/CD pipeline
└── 📖 README.md                    # This file
```

## 🔧 Setup and Configuration

### 1. Clone the Repository

```bash
git clone https://github.com/MaryyamGamal/Todo-app.git
cd Todo-app
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_DB_URL=mongodb://mongodb:27017/todoapp
PORT=4000
```

### 3. GitHub Secrets Configuration

For the CI/CD pipeline to work, add these secrets in your GitHub repository:

**Repository Settings → Secrets and Variables → Actions → New Repository Secret**

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `your-username` |
| `DOCKER_PASSWORD` | Docker Hub password | `your-password` |
| `DOCKER_REPO` | Docker Hub repository | `username/todo-app` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `xyz123...` |

## 🚀 Deployment Options

### Option 1: Quick Start with Docker Compose (Recommended for Development)

**Single command to run everything:**

```bash
docker-compose up -d
```

**What this does:**
- ✅ Starts MongoDB container
- ✅ Builds and starts the Todo app
- ✅ Sets up networking between containers
- ✅ Configures health checks

**Access the app:** http://localhost:4000

**Stop the app:**
```bash
docker-compose down
```

### Option 2: Docker Only

**Build and run manually:**

```bash
# Build the image
docker build -t todo-app .

# Run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Run the app (adjust MONGO_DB_URL as needed)
docker run -d --name todo-app -p 4000:4000 \
  -e MONGO_DB_URL=mongodb://host.docker.internal:27017/todoapp \
  todo-app
```

### Option 3: Kubernetes Deployment

**Deploy to Kubernetes cluster:**

```bash
# Apply in this order
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/mongodb-pvc.yaml
kubectl apply -f kubernetes/mongodb-deployment-service.yaml
kubectl apply -f kubernetes/argocd-app.yaml
```

**Check deployment status:**
```bash
kubectl get pods -n todo-app-namespace
kubectl get services -n todo-app-namespace
```

### Option 4: GitOps with ArgoCD

**Prerequisites:** ArgoCD installed in your cluster

**Setup:**
```bash
# Apply the ArgoCD application
kubectl apply -f kubernetes/argocd-app.yaml
```

**What ArgoCD does:**
- 🔍 Monitors this GitHub repository
- 🔄 Automatically syncs changes to Kubernetes
- 🛡️ Self-heals if manual changes are made
- 📊 Provides web UI for deployment status

## 🔄 Complete Workflow: From Code to Production

### Step 1: Developer Makes Changes
```bash
# Make your code changes
git add .
git commit -m "Add new feature"
git push origin master
```

### Step 2: Automated CI/CD Pipeline Triggers

**GitHub Actions automatically:**

1. **🔍 Checks out** your code
2. **🔐 Logs in** to Docker Hub and AWS ECR
3. **🏗️ Builds** Docker image from your code
4. **🏷️ Tags** image with `latest` and `previous`
5. **📤 Pushes** to both Docker Hub and ECR
6. **✅ Reports** success/failure

**View pipeline progress:** GitHub → Actions tab

### Step 3: Deployment (Multiple Options)

#### Option A: Manual Deployment
```bash
# Pull latest image and restart
docker-compose pull
docker-compose up -d
```

#### Option B: Kubernetes Update
```bash
# Force update with latest image
kubectl rollout restart deployment/todo-app -n todo-app-namespace
```

#### Option C: GitOps (Fully Automated)
**ArgoCD automatically:**
- Detects the new image in ECR
- Updates Kubernetes deployment
- Monitors health and rolls back if needed
- **Zero manual intervention required!**

## 🔍 Monitoring and Troubleshooting

### Check Application Status

**Docker Compose:**
```bash
docker-compose ps
docker-compose logs todo-app
```

**Kubernetes:**
```bash
kubectl get pods -n todo-app-namespace
kubectl logs deployment/todo-app -n todo-app-namespace
```

**ArgoCD:**
- Access ArgoCD UI (usually http://localhost:8080)
- Check sync status and application health

### Common Issues and Solutions

| Problem | Solution |
|---------|----------|
| App can't connect to MongoDB | Check network settings in docker-compose.yaml |
| Pipeline fails at Docker login | Verify GitHub secrets are set correctly |
| Kubernetes pods stuck in Pending | Check if PVC is bound: `kubectl get pvc` |
| ArgoCD out of sync | Manually sync in ArgoCD UI or check repo permissions |

## 🎯 Development Workflow

### For New Features:
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes in `server/` directory
3. Test locally: `docker-compose up -d`
4. Commit and push: `git push origin feature/new-feature`
5. Create Pull Request to `master`
6. After merge → Automatic deployment!

### For Infrastructure Changes:
1. Modify files in `kubernetes/` directory
2. Commit and push to `master`
3. ArgoCD automatically applies changes
4. Monitor in ArgoCD dashboard

## 📊 Architecture Overview

```
Developer Push → GitHub → GitHub Actions → Docker Hub/ECR → ArgoCD → Kubernetes → Running App
     ↓              ↓            ↓              ↓           ↓          ↓           ↓
   Code Changes → Trigger → Build Image → Store Image → Detect → Deploy → Serve Users
```

## 🛠️ Customization

### Modify MongoDB Configuration
Edit `kubernetes/mongodb-deployment-service.yaml`:
- Change resource limits
- Modify storage size in `mongodb-pvc.yaml`
- Update environment variables

### Update Application Settings
Edit `docker-compose.yaml` or Kubernetes deployments:
- Change port mappings
- Modify environment variables
- Adjust health check intervals

### Pipeline Customization
Edit `.github/workflows/ci-cd.yaml`:
- Add testing steps
- Modify build process
- Add notifications

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎉 Success!

Once deployed, your Todo app will be running and accessible at:
- **Local Development:** http://localhost:4000
- **Kubernetes:** Check service endpoint with `kubectl get services`

The complete GitOps workflow ensures that every code change is automatically built, tested, and deployed with zero downtime!

---

**Happy coding! 🚀**
