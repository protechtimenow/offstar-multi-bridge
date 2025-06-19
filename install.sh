#!/bin/bash

echo "🚀 Installing OFFSTAR Multi-Bridge Connector..."
echo "==============================================="

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${!1}%s${NC}\\n" "$2"
}

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_color "YELLOW" "📦 Node.js not found. Installing..."
    
    # Detect OS and install Node.js
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        elif command -v pacman &> /dev/null; then
            sudo pacman -S nodejs npm
        else
            print_color "RED" "❌ Unsupported Linux distribution. Please install Node.js manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            print_color "YELLOW" "Installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install node
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        print_color "YELLOW" "Please install Node.js from: https://nodejs.org"
        print_color "YELLOW" "Then run this script again."
        exit 1
    else
        print_color "RED" "❌ Unsupported OS. Please install Node.js manually: https://nodejs.org"
        exit 1
    fi
else
    print_color "GREEN" "✅ Node.js found: $(node --version)"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    print_color "RED" "❌ npm not found. Please install npm."
    exit 1
else
    print_color "GREEN" "✅ npm found: $(npm --version)"
fi

# Install npm dependencies
print_color "BLUE" "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_color "RED" "❌ Failed to install dependencies"
    exit 1
fi

# Create config file if it doesn't exist
if [ ! -f "config.json" ]; then
    print_color "YELLOW" "📝 Creating config.json from example..."
    cp config.example.json config.json
    print_color "YELLOW" "⚠️  Please edit config.json with your API keys"
else
    print_color "GREEN" "✅ config.json already exists"
fi

# Make scripts executable
chmod +x mobile-bridge.js

# Create storage directory
mkdir -p storage
mkdir -p logs

# Test installation
print_color "BLUE" "🧪 Testing installation..."
if node -e "require('./multi-bridge.js')" 2>/dev/null; then
    print_color "GREEN" "✅ Multi-bridge system loads successfully"
else
    print_color "RED" "❌ Failed to load multi-bridge system"
    exit 1
fi

print_color "GREEN" "✅ Installation complete!"
echo ""
print_color "BLUE" "🎯 Next steps:"
echo "   1. Edit config.json with your API keys:"
echo "      nano config.json"
echo ""
echo "   2. Start the Multi-Bridge Connector:"
echo "      npm start"
echo ""
echo "   3. Test the installation:"
echo "      npm test"
echo ""
print_color "YELLOW" "📱 Mobile commands:"
echo "   • npm run voice \"connect to github\""
echo "   • curl http://localhost:3001/health"
echo "   • curl http://localhost:3001/bridges"
echo ""
print_color "BLUE" "📚 Documentation:"
echo "   • README.md - Full documentation"
echo "   • examples/ - Usage examples"
echo "   • GitHub: https://github.com/protechtimenow/offstar-multi-bridge"
echo ""
print_color "GREEN" "🌉 OFFSTAR Multi-Bridge Connector ready!"
print_color "GREEN" "Your Enterprise AGI Business Hub awaits! 🚀"