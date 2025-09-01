import { useState, useEffect } from 'react';
import {
  searchAttackSuccessPatterns,
  searchResponseClusters,
  searchRefusalPatterns,
  searchContentAnalysis,
  searchEvaluationEfficiency
} from '../api';

// Synthwave color scheme
const SYNTHWAVE_COLORS = {
  background: "#0d001a",
  primary: "#ff00ff",
  secondary: "#00ffff",
  accent: "#ff0080",
  text: "#ffffff",
  textSecondary: "#a0a0ff",
  card: "#1a002e",
  border: "#4d0099",
  success: "#00ff41",
  warning: "#ffff00",
  danger: "#ff0040"
};

function SearchTab() {
  const [activeSearch, setActiveSearch] = useState('attack-success');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search parameters
  const [attackSuccessParams, setAttackSuccessParams] = useState({
    similarity_threshold: '0.3',
    limit: '50'
  });
  
  const [clusterParams, setClusterParams] = useState({
    similarity_threshold: '0.2',
    min_cluster_size: '3'
  });
  
  const [refusalParams, setRefusalParams] = useState({
    refusal_keywords: 'cannot,sorry,unable,can\'t,won\'t',
    similarity_threshold: '0.3',
    limit: '50'
  });
  
  const [contentParams, setContentParams] = useState({
    query_text: '',
    content_type: 'responses',
    similarity_threshold: '0.4',
    limit: '50'
  });
  
  const [efficiencyParams, setEfficiencyParams] = useState({
    target_response_text: '',
    similarity_threshold: '0.3',
    limit: '20'
  });

  // Auto-run certain searches on mount
  useEffect(() => {
    if (activeSearch === 'attack-success') {
      executeSearch();
    } else if (activeSearch === 'response-clusters') {
      executeSearch();
    } else if (activeSearch === 'refusal-patterns') {
      executeSearch();
    }
  }, [activeSearch]);

  const executeSearch = async () => {
    setLoading(true);
    setError('');
    setSearchResults([]);
    
    try {
      let results = [];
      
      switch (activeSearch) {
        case 'attack-success':
          results = await searchAttackSuccessPatterns(attackSuccessParams);
          break;
        case 'response-clusters':
          results = await searchResponseClusters(clusterParams);
          break;
        case 'refusal-patterns':
          results = await searchRefusalPatterns(refusalParams);
          break;
        case 'content-analysis':
          if (!contentParams.query_text.trim()) {
            setError('Please enter text to search for');
            setLoading(false);
            return;
          }
          results = await searchContentAnalysis(contentParams);
          break;
        case 'evaluation-efficiency':
          if (!efficiencyParams.target_response_text.trim()) {
            setError('Please enter response text to find similar evaluations');
            setLoading(false);
            return;
          }
          results = await searchEvaluationEfficiency(efficiencyParams);
          break;
      }
      
      setSearchResults(results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const searchConfigs = {
    'attack-success': {
      title: '🎯 Attack Success Patterns',
      description: 'Find responses similar to known successful attacks',
      icon: '⚡'
    },
    'response-clusters': {
      title: '🔗 Response Clustering',
      description: 'Group similar responses to identify common model behaviors',
      icon: '🌐'
    },
    'refusal-patterns': {
      title: '🚫 Refusal Detection',
      description: 'Identify when models give similar refusal patterns',
      icon: '🛡️'
    },
    'content-analysis': {
      title: '🔍 Content Analysis',
      description: 'Find content similar to your search query',
      icon: '📊'
    },
    'evaluation-efficiency': {
      title: '⚡ Evaluation Efficiency',
      description: 'Find similar responses that have already been evaluated',
      icon: '🎯'
    }
  };

  const renderSearchControls = () => {
    const cardStyle = {
      backgroundColor: SYNTHWAVE_COLORS.card,
      border: `1px solid ${SYNTHWAVE_COLORS.border}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    };

    const inputStyle = {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: SYNTHWAVE_COLORS.background,
      color: SYNTHWAVE_COLORS.text,
      border: `1px solid ${SYNTHWAVE_COLORS.border}`,
      borderRadius: '4px',
      fontSize: '14px'
    };

    const labelStyle = {
      display: 'block',
      color: SYNTHWAVE_COLORS.textSecondary,
      marginBottom: '5px',
      fontSize: '12px',
      textTransform: 'uppercase'
    };

    switch (activeSearch) {
      case 'attack-success':
        return (
          <div style={cardStyle}>
            <h4 style={{ color: SYNTHWAVE_COLORS.primary, marginTop: 0 }}>Attack Success Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Similarity Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={attackSuccessParams.similarity_threshold}
                  onChange={(e) => setAttackSuccessParams({
                    ...attackSuccessParams,
                    similarity_threshold: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Limit</label>
                <input
                  type="number"
                  value={attackSuccessParams.limit}
                  onChange={(e) => setAttackSuccessParams({
                    ...attackSuccessParams,
                    limit: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
        
      case 'response-clusters':
        return (
          <div style={cardStyle}>
            <h4 style={{ color: SYNTHWAVE_COLORS.primary, marginTop: 0 }}>Clustering Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Similarity Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={clusterParams.similarity_threshold}
                  onChange={(e) => setClusterParams({
                    ...clusterParams,
                    similarity_threshold: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Min Cluster Size</label>
                <input
                  type="number"
                  min="2"
                  value={clusterParams.min_cluster_size}
                  onChange={(e) => setClusterParams({
                    ...clusterParams,
                    min_cluster_size: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
        
      case 'refusal-patterns':
        return (
          <div style={cardStyle}>
            <h4 style={{ color: SYNTHWAVE_COLORS.primary, marginTop: 0 }}>Refusal Detection Settings</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Refusal Keywords (comma-separated)</label>
              <input
                type="text"
                value={refusalParams.refusal_keywords}
                onChange={(e) => setRefusalParams({
                  ...refusalParams,
                  refusal_keywords: e.target.value
                })}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Similarity Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={refusalParams.similarity_threshold}
                  onChange={(e) => setRefusalParams({
                    ...refusalParams,
                    similarity_threshold: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Limit</label>
                <input
                  type="number"
                  value={refusalParams.limit}
                  onChange={(e) => setRefusalParams({
                    ...refusalParams,
                    limit: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
        
      case 'content-analysis':
        return (
          <div style={cardStyle}>
            <h4 style={{ color: SYNTHWAVE_COLORS.primary, marginTop: 0 }}>Content Search Settings</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Search Query</label>
              <textarea
                value={contentParams.query_text}
                onChange={(e) => setContentParams({
                  ...contentParams,
                  query_text: e.target.value
                })}
                placeholder="Enter text to find similar content..."
                style={{
                  ...inputStyle,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Content Type</label>
                <select
                  value={contentParams.content_type}
                  onChange={(e) => setContentParams({
                    ...contentParams,
                    content_type: e.target.value
                  })}
                  style={inputStyle}
                >
                  <option value="responses">Responses</option>
                  <option value="prompts">Prompt Variants</option>
                  <option value="seeds">Seed Prompts</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Similarity Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={contentParams.similarity_threshold}
                  onChange={(e) => setContentParams({
                    ...contentParams,
                    similarity_threshold: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Limit</label>
                <input
                  type="number"
                  value={contentParams.limit}
                  onChange={(e) => setContentParams({
                    ...contentParams,
                    limit: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
        
      case 'evaluation-efficiency':
        return (
          <div style={cardStyle}>
            <h4 style={{ color: SYNTHWAVE_COLORS.primary, marginTop: 0 }}>Evaluation Efficiency Settings</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Target Response Text</label>
              <textarea
                value={efficiencyParams.target_response_text}
                onChange={(e) => setEfficiencyParams({
                  ...efficiencyParams,
                  target_response_text: e.target.value
                })}
                placeholder="Paste response text to find similar evaluated responses..."
                style={{
                  ...inputStyle,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Similarity Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={efficiencyParams.similarity_threshold}
                  onChange={(e) => setEfficiencyParams({
                    ...efficiencyParams,
                    similarity_threshold: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Limit</label>
                <input
                  type="number"
                  value={efficiencyParams.limit}
                  onChange={(e) => setEfficiencyParams({
                    ...efficiencyParams,
                    limit: e.target.value
                  })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: SYNTHWAVE_COLORS.secondary
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄 Searching...</div>
          <div>Processing vector similarity search</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          backgroundColor: SYNTHWAVE_COLORS.card,
          border: `1px solid ${SYNTHWAVE_COLORS.danger}`,
          borderRadius: '8px',
          padding: '15px',
          color: SYNTHWAVE_COLORS.danger
        }}>
          <strong>⚠️ Search Error:</strong> {error}
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: SYNTHWAVE_COLORS.textSecondary,
          backgroundColor: SYNTHWAVE_COLORS.card,
          borderRadius: '8px',
          border: `1px solid ${SYNTHWAVE_COLORS.border}`
        }}>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>📭 No results found</div>
          <div>Try adjusting your search parameters or check if embeddings have been generated</div>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gap: '15px'
      }}>
        {searchResults.map((result, index) => (
          <div key={index} style={{
            backgroundColor: SYNTHWAVE_COLORS.card,
            border: `1px solid ${SYNTHWAVE_COLORS.border}`,
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '10px'
            }}>
              <div style={{
                color: SYNTHWAVE_COLORS.primary,
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {result.session_name || `Session ${result.session_id}`}
                {result.similarity && (
                  <span style={{ 
                    color: SYNTHWAVE_COLORS.secondary,
                    marginLeft: '10px'
                  }}>
                    {Math.round(result.similarity * 100)}% match
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                {result.is_dangerous !== undefined && (
                  <span style={{
                    color: result.is_dangerous ? SYNTHWAVE_COLORS.danger : SYNTHWAVE_COLORS.success,
                    fontWeight: 'bold'
                  }}>
                    {result.is_dangerous ? '🚨 DANGEROUS' : '✅ SAFE'}
                  </span>
                )}
                
                {result.evaluation_score !== undefined && (
                  <span style={{ color: SYNTHWAVE_COLORS.warning }}>
                    Score: {result.evaluation_score}
                  </span>
                )}
                
                {result.cluster_size && (
                  <span style={{ color: SYNTHWAVE_COLORS.secondary }}>
                    Cluster: {result.cluster_size} items
                  </span>
                )}
              </div>
            </div>
            
            {result.prompt_text && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  color: SYNTHWAVE_COLORS.textSecondary,
                  fontSize: '12px',
                  marginBottom: '5px'
                }}>
                  PROMPT:
                </div>
                <div style={{
                  backgroundColor: SYNTHWAVE_COLORS.background,
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {result.prompt_text}
                </div>
              </div>
            )}
            
            <div>
              <div style={{
                color: SYNTHWAVE_COLORS.textSecondary,
                fontSize: '12px',
                marginBottom: '5px'
              }}>
                {result.target_response ? 'RESPONSE:' : 'CONTENT:'}
              </div>
              <div style={{
                backgroundColor: SYNTHWAVE_COLORS.background,
                padding: '10px',
                borderRadius: '4px',
                fontSize: '13px',
                lineHeight: 1.4,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {result.target_response || result.content}
              </div>
            </div>
            
            {result.evaluation_response && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  color: SYNTHWAVE_COLORS.textSecondary,
                  fontSize: '12px',
                  marginBottom: '5px'
                }}>
                  EVALUATION:
                </div>
                <div style={{
                  backgroundColor: SYNTHWAVE_COLORS.background,
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {result.evaluation_response}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      color: SYNTHWAVE_COLORS.text,
      maxWidth: '1200px'
    }}>
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: SYNTHWAVE_COLORS.primary,
          fontSize: '28px',
          marginBottom: '10px',
          textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
        }}>
          🔍 Vector Search Dashboard
        </h2>
        <p style={{ 
          color: SYNTHWAVE_COLORS.textSecondary,
          fontSize: '16px',
          margin: 0
        }}>
          Discover patterns and insights using AI embedding similarity search
        </p>
      </div>

      {/* Search Type Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {Object.entries(searchConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveSearch(key)}
            style={{
              backgroundColor: activeSearch === key ? SYNTHWAVE_COLORS.primary : SYNTHWAVE_COLORS.card,
              color: activeSearch === key ? SYNTHWAVE_COLORS.background : SYNTHWAVE_COLORS.text,
              border: `2px solid ${activeSearch === key ? SYNTHWAVE_COLORS.primary : SYNTHWAVE_COLORS.border}`,
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (activeSearch !== key) {
                e.target.style.backgroundColor = SYNTHWAVE_COLORS.accent;
                e.target.style.borderColor = SYNTHWAVE_COLORS.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (activeSearch !== key) {
                e.target.style.backgroundColor = SYNTHWAVE_COLORS.card;
                e.target.style.borderColor = SYNTHWAVE_COLORS.border;
              }
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {config.icon}
            </div>
            <div style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '5px'
            }}>
              {config.title}
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.8,
              lineHeight: 1.3
            }}>
              {config.description}
            </div>
          </button>
        ))}
      </div>

      {/* Search Controls */}
      {renderSearchControls()}

      {/* Search Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={executeSearch}
          disabled={loading}
          style={{
            backgroundColor: SYNTHWAVE_COLORS.secondary,
            color: SYNTHWAVE_COLORS.background,
            border: 'none',
            borderRadius: '25px',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.3s ease',
            textShadow: 'none'
          }}
        >
          {loading ? '🔄 Searching...' : `🚀 Execute ${searchConfigs[activeSearch].title}`}
        </button>
      </div>

      {/* Results */}
      <div>
        <h3 style={{
          color: SYNTHWAVE_COLORS.secondary,
          fontSize: '20px',
          marginBottom: '20px'
        }}>
          📊 Search Results ({searchResults.length})
        </h3>
        {renderResults()}
      </div>
    </div>
  );
}

export default SearchTab;