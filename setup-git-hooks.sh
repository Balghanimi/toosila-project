#!/bin/bash
#
# سكريبت لإعداد Git Hooks للتطبيق Toosila
#

echo "🔧 Setting up Git Hooks for Toosila..."

# التأكد من وجود مجلد .git/hooks
if [ ! -d ".git/hooks" ]; then
    echo "❌ Error: .git/hooks directory not found!"
    echo "   Make sure you're in the root of the git repository."
    exit 1
fi

# جعل pre-commit hook قابلاً للتنفيذ
if [ -f ".git/hooks/pre-commit" ]; then
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook is now executable"
else
    echo "❌ Error: pre-commit hook not found!"
    exit 1
fi

# اختبار الـ hook
echo ""
echo "📝 Testing the hook..."
echo ""

# عرض محتويات الـ hook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pre-commit hook is located at: .git/hooks/pre-commit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Git hooks setup completed!"
echo ""
echo "📚 Usage:"
echo "   Normal commit:     git commit -m 'message'"
echo "   Skip tests once:   git commit --no-verify -m 'message'"
echo "   Skip tests always: export SKIP_TESTS_ON_COMMIT=1"
echo "   Backend only:      export TEST_MODE=backend"
echo "   Frontend only:     export TEST_MODE=frontend"
echo ""
echo "📖 For more info, see: .git/hooks/README.md"
