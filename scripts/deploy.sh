#!/bin/bash

set -e

COMPOSE_FILE="../docker-compose.yml"
ENV_FILE="../.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

usage() {
    echo -e "${CYAN}Usage: $0 {up|down|restart|logs|status|build}${NC}"
    echo ""
    echo "  up        Build and start all services (default)"
    echo "  down      Stop and remove all services"
    echo "  restart   Restart all services"
    echo "  logs      Tail logs from all services"
    echo "  status    Show service status"
    echo "  build     Rebuild images without starting"
    exit 1
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

show_status() {
    echo -e "\n${CYAN}=== ChartFlow Service Status ===${NC}"
    docker compose -f "$COMPOSE_FILE" ps
}

ENV_ARGS=()
if [ -f "$ENV_FILE" ]; then
    ENV_ARGS=("--env-file" "$ENV_FILE")
fi

ACTION="${1:-up}"

case "$ACTION" in
    up)
        check_docker
        echo -e "${GREEN}Starting ChartFlow...${NC}"
        docker compose -f "$COMPOSE_FILE" "${ENV_ARGS[@]}" up -d --build
        echo -e "\n${GREEN}ChartFlow is starting! Access it at:${NC}"
        echo -e "  ${YELLOW}Frontend: http://localhost${NC}"
        echo -e "  ${YELLOW}API:      http://localhost:5000/api/v1${NC}"
        echo -e "  ${YELLOW}API Docs: http://localhost:5000/api-docs${NC}"
        show_status
        ;;
    down)
        echo -e "${YELLOW}Stopping ChartFlow...${NC}"
        docker compose -f "$COMPOSE_FILE" "${ENV_ARGS[@]}" down -v
        echo -e "${GREEN}ChartFlow stopped.${NC}"
        ;;
    restart)
        echo -e "${YELLOW}Restarting ChartFlow...${NC}"
        docker compose -f "$COMPOSE_FILE" "${ENV_ARGS[@]}" restart
        show_status
        ;;
    logs)
        docker compose -f "$COMPOSE_FILE" "${ENV_ARGS[@]}" logs -f
        ;;
    status)
        show_status
        ;;
    build)
        check_docker
        echo -e "${GREEN}Building ChartFlow images...${NC}"
        docker compose -f "$COMPOSE_FILE" "${ENV_ARGS[@]}" build --no-cache
        echo -e "${GREEN}Build complete.${NC}"
        ;;
    *)
        usage
        ;;
esac
