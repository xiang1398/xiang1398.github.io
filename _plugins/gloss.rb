# _plugins/gloss.rb

module Jekyll
  class GlossBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super

      args = markup.strip.split(/\s+/, 2)

      @number = args[0]

      @title = nil
      if args[1]
        @title = args[1].strip
        @title = @title.gsub(/\A["']|["']\z/, "")
      end
    end

    def render(context)
      raw = super(context)

      lines = raw
        .lines
        .map(&:strip)
        .reject { |line| line.empty? }

      return "" if lines.empty?

      translation = nil

      # 마지막 줄이 따옴표로 시작하면 번역문으로 처리
      if lines.last =~ /\A['‘"]/
        translation = lines.pop
      end

      source_line = lines[0]
      trans_line  = lines[1]
      gloss_line  = lines[2]

      source_tokens = split_tokens(source_line)
      trans_tokens  = split_tokens(trans_line)
      gloss_tokens  = split_tokens(gloss_line)

      token_count = [
        source_tokens.length,
        trans_tokens.length,
        gloss_tokens.length
      ].max

      html = +""

      html << %(<div class="gloss-block">\n)

      html << %(  <div class="gloss-label">\n)
      html << %(    <span class="gloss-num">예문 #{h(@number)}</span>\n) if @number && !@number.empty?
      html << %(    <span class="gloss-title">#{h(@title)}</span>\n) if @title && !@title.empty?
      html << %(  </div>\n)

      html << %(  <div class="gloss-table">\n)

      token_count.times do |i|
        src = source_tokens[i]
        trn = trans_tokens[i]
        gls = gloss_tokens[i]

        html << %(    <div class="gloss-token">\n)
        html << %(      <div class="gloss-source">#{h(src)}</div>\n) if present?(src)
        html << %(      <div class="gloss-transcription">#{h(trn)}</div>\n) if present?(trn)
        html << %(      <div class="gloss-meaning">#{h(gls)}</div>\n) if present?(gls)
        html << %(    </div>\n)
      end

      html << %(  </div>\n)

      if present?(translation)
        html << %(  <div class="gloss-translation">#{h(translation)}</div>\n)
      end

      html << %(</div>\n)

      html
    end

    private

    def split_tokens(line)
      return [] unless line
      line.split("|").map(&:strip)
    end

    def present?(value)
      value && !value.empty?
    end

    def h(value)
      return "" unless value

      value.to_s
        .gsub("&", "&amp;")
        .gsub("<", "&lt;")
        .gsub(">", "&gt;")
        .gsub('"', "&quot;")
    end
  end
end

Liquid::Template.register_tag("gloss", Jekyll::GlossBlock)
