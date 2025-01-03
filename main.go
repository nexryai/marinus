package main

import (
	"github.com/nexryai/marinus/internal/system/logger"
)

func main() {
	log := logger.GetLogger("BOOT")
	log.Info("Initializing marinus worker...")
}
