# frozen_string_literal: true

require "cgi"

Jekyll::Hooks.register :posts, :post_render do |post|
  histories = post.site.data.fetch("revision_history", {})
  entries = histories[post.relative_path]
  next if entries.nil? || entries.empty?

  items = entries.map do |entry|
    date = CGI.escapeHTML(entry.fetch("date", "").to_s)
    text = CGI.escapeHTML(entry.fetch("text", "").to_s)
    %(<li><strong>#{date}</strong> — #{text}</li>)
  end.join("\n")

  section = <<~HTML

    <hr>
    <section class="revision-history" aria-labelledby="revision-history-heading">
      <h2 id="revision-history-heading">개정 이력</h2>
      <ul>
        #{items}
      </ul>
    </section>
  HTML

  post.output << section
end
